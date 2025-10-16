import { Color, LastMove } from "../models/models";
import { Piece } from "./piece";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";


export class FENConverter {
    public static readonly initalPosition: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public convertBoardToFEN(
        board: (Piece | null)[][],
        playerColor: Color,
        lastMove: LastMove | undefined,
        fiftyMoveRuleCounter: number,
        numberOfFullMoves: number
    ): string {
        let FEN: string = "";

        for (let i = 7; i >= 0; i--) {
            let FENRow: string = "";
            let consecutiveEmptySquaresCounter = 0;

            for (const piece of board[i]) {
                if (!piece) {
                    consecutiveEmptySquaresCounter++;
                    continue;
                }

                if (consecutiveEmptySquaresCounter !== 0)
                    FENRow += String(consecutiveEmptySquaresCounter);

                consecutiveEmptySquaresCounter = 0;
                FENRow += piece.FENChar;
            }

            if (consecutiveEmptySquaresCounter !== 0)
                FENRow += String(consecutiveEmptySquaresCounter);

            FEN += (i === 0) ? FENRow : FENRow + "/";
        }

        const player: string = playerColor === Color.White ? "w" : "b";
        FEN += " " + player;
        FEN += " " + this.castlingAvailability(board);
        FEN += " " + this.enPassantPosibility(lastMove, playerColor, board);
        FEN += " " + fiftyMoveRuleCounter;
        FEN += " " + numberOfFullMoves;
        return FEN;
    }

    private castlingAvailability(board: (Piece | null)[][]): string {
        const castlingPossibilities = (color: Color): string => {
            let castlingAvailability: string = "";

            const kingPositionX: number = color === Color.White ? 0 : 7;
            const king: Piece | null = board[kingPositionX][4];

            if (king instanceof King && !king.hasMoved) {
                const rookPositionX: number = kingPositionX;
                const kingSideRook = board[rookPositionX][7];
                const queenSideRook = board[rookPositionX][0];

                if (kingSideRook instanceof Rook && !kingSideRook.hasMoved)
                    castlingAvailability += "k";

                if (queenSideRook instanceof Rook && !queenSideRook.hasMoved)
                    castlingAvailability += "q";

                if (color === Color.White)
                    castlingAvailability = castlingAvailability.toUpperCase();
            }
            return castlingAvailability;
        }

        const castlingAvailability: string = castlingPossibilities(Color.White) + castlingPossibilities(Color.Black);
        return castlingAvailability !== "" ? castlingAvailability : "-";
    }

    private enPassantPosibility(
        lastMove: LastMove | undefined,
        color: Color,
        board: (Piece | null)[][]
    ): string {
        if (!lastMove) return "-";

        const { piece, toX: newX, toY, fromX, fromY } = lastMove;

        // Only pawns that moved two squares can trigger en passant
        if (!(piece instanceof Pawn) || Math.abs(newX - fromX) !== 2) return "-";

        const directions = [-1, 1]; // check both left and right
        const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

        for (const dir of directions) {
            const adjY = toY + dir;
            if (adjY < 0 || adjY > 7) continue; // skip invalid columns

            const adjacentPiece = board[newX][adjY];
            if (adjacentPiece instanceof Pawn && adjacentPiece.color !== piece.color) {
                const row = color === Color.White ? 6 : 3; // target en passant capture rank
                return columns[toY] + String(row);
            }
        }

        return "-";
    }


    public convertFENToBoard(fen: string): (Piece | null)[][] {
        const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
        const [piecePlacement] = fen.split(" ");

        const rows = piecePlacement.split("/");

        for (let i = 0; i < 8; i++) {
            const row = rows[7 - i]; // FEN starts from rank 8
            let colIndex = 0;

            for (const char of row) {
                if (colIndex >= 8) break;

                const emptySquares = parseInt(char);
                if (!isNaN(emptySquares)) {
                    colIndex += emptySquares;
                    continue;
                }

                const piece = this.charToPiece(char);
                if (piece) {
                    board[i][colIndex] = piece;
                    colIndex++;
                }
            }
        }

        return board;
    }

    private charToPiece(char: string): Piece | null {
        const isWhite = char === char.toUpperCase();
        const color = isWhite ? Color.White : Color.Black;
        const lowerChar = char.toLowerCase();

        switch (lowerChar) {
            case "p": return new Pawn(color);
            case "r": return new Rook(color);
            case "n": return new Knight(color);
            case "b": return new Bishop(color);
            case "q": return new Queen(color);
            case "k": return new King(color);
            default: return null;
        }
    }

}