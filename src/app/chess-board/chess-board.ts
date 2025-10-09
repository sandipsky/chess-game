import { Component } from '@angular/core';
import { CheckState, Color, Coords, FENChar, LastMove, pieceImagePaths, PossibleMoves, Square } from "../models/models";
import { Bishop } from "../models/pieces/bishop";
import { King } from "../models/pieces/king";
import { Knight } from "../models/pieces/knight";
import { Pawn } from "../models/pieces/pawn";
import { Piece } from "../models/pieces/piece";
import { Queen } from "../models/pieces/queen";
import { Rook } from "../models/pieces/rook";

@Component({
  selector: 'app-chess-board',
  imports: [],
  templateUrl: './chess-board.html',
  styleUrl: './chess-board.scss'
})

export class ChessBoardComponent {
  public pieceImagePaths = pieceImagePaths;
  public chessBoard: (Piece | null)[][];
  private _playerColor = Color.White;
  private _selectedSquare: Square = { piece: null };
  public possibleMoves: PossibleMoves;
  private _piecePossibleMoves: Coords[] = [];
  private _lastMove: LastMove | undefined;
  private _checkState: CheckState = { isInCheck: false };
  public promotionDialog: { visible: boolean, fromX?: number, fromY?: number, toX?: number, toY?: number } = { visible: false };

  constructor() {
    // this.chessBoard = [
    //   [new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
    //   new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White)
    //   ],
    //   Array(8).fill(null).map(() => new Pawn(Color.White)),
    //   [null, null, null, null, null, null, null, null,],
    //   [null, null, null, null, null, null, null, null,],
    //   [null, null, null, null, null, null, null, null,],
    //   [null, null, null, null, null, null, null, null,],
    //   Array(8).fill(null).map(() => new Pawn(Color.Black)),
    //   [new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
    //   new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black)
    //   ],
    // ]

    this.chessBoard = [
      [null, null, null, null, null, null, null, null,],
      [new Pawn(Color.Black), null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, new Pawn(Color.White)],
      [null, null, null, null, null, null, null, null,],
    ]

    this.possibleMoves = this.findPossibleMoves();
  }

  // Getters
  public get playerColor(): Color {
    return this._playerColor;
  }

  public get lastMove(): LastMove | undefined {
    return this._lastMove;
  }

  public get checkState(): CheckState {
    return this._checkState;
  }

  public promotionPieces(): FENChar[] {
    return this.playerColor === Color.White ?
      [FENChar.WhiteKnight, FENChar.WhiteBishop, FENChar.WhiteRook, FENChar.WhiteQueen, FENChar.WhiteKing] :
      [FENChar.BlackKnight, FENChar.BlackBishop, FENChar.BlackRook, FENChar.BlackQueen, FENChar.BlackKing];
  }

  private isWrongPieceSelected(piece: Piece): boolean {
    const isWhitePieceSelected = piece.color === Color.White;
    return (isWhitePieceSelected && this._playerColor === Color.Black) ||
      (!isWhitePieceSelected && this._playerColor === Color.White);
  }

  private unmarkPieceandSquares(): void {
    this._selectedSquare = { piece: null };
    this._piecePossibleMoves = [];
  }

  public selectPiece(x: number, y: number): void {
    const piece: Piece | null = this.chessBoard[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;

    // Unselect piece if already selected
    if (this._selectedSquare.x == x && this._selectedSquare.y == y && !!this._selectedSquare.piece) {
      this.unmarkPieceandSquares();
      return;
    }

    this._selectedSquare = { piece, x, y };
    this._piecePossibleMoves = this.possibleMoves.get(`${x},${y}`) || [];
  }



  public selectOrMove(x: number, y: number) {
    this.selectPiece(x, y);
    this.movePiece(x, y);
  }

  public movePiece(toX: number, toY: number): void {
    if (!this._selectedSquare.piece) return;
    if (!this.isSquareSafeForSelectedPiece(toX, toY)) return;

    const fromX = Number(this._selectedSquare.x);
    const fromY = Number(this._selectedSquare.y);

    if (!this.areCoordsValid(fromX, fromY) || !this.areCoordsValid(toX, toY)) return;

    const piece: Piece | null = this.chessBoard[fromX][fromY];

    if (!piece || piece.color !== this._playerColor) return;

    const piecePossibleMoves = this.possibleMoves.get(fromX + "," + fromY);

    if (!piecePossibleMoves || !piecePossibleMoves.find(coords => coords.x == toX && coords.y == toY)) {
      throw new Error("Square is not Safe");
    }

    if ((piece instanceof Pawn || piece instanceof King || piece instanceof Rook) && !piece.hasMoved) {
      piece.hasMoved = true;
    }

    //Moving Rook if King 2 step moved i.e Castiling
    if (piece instanceof King && Math.abs(toY - fromY) === 2) {
      const isKingSideCastle = toY > fromY;
      this.castle(isKingSideCastle, fromX);
    }

    //Caputring Pawn if en passant move
    if (
      piece instanceof Pawn &&
      this._lastMove &&
      this._lastMove.piece instanceof Pawn &&
      Math.abs(this._lastMove.toX - this._lastMove.fromX) === 2 &&
      fromX === this._lastMove.toX &&
      toY === this._lastMove.toY
    ) {
      this.chessBoard[this._lastMove.toX][this._lastMove.toY] = null;
    }


    //update Board
    this.chessBoard[fromX][fromY] = null;
    this.chessBoard[toX][toY] = piece;

    const isPawnSelected: boolean = this._selectedSquare.piece.FENChar === FENChar.WhitePawn || this._selectedSquare.piece.FENChar === FENChar.BlackPawn;
    const isPawnOnlastRank: boolean = toX === 7 || toX === 0;

    if (isPawnSelected && isPawnOnlastRank) {
      this.promotionDialog = { visible: true, fromX, fromY, toX, toY };
    }
    else {
      this.updateBoard(fromX, fromY, toX, toY, piece);
    }
  }

  updateBoard(fromX: number, fromY: number, toX: number, toY: number, piece: Piece): void {
    this._lastMove = { fromX, fromY, toX, toY, piece };
    this._playerColor = this._playerColor == Color.White ? Color.Black : Color.White;
    this.isInCheck(this._playerColor, true);
    this.possibleMoves = this.findPossibleMoves();
    this.unmarkPieceandSquares();
  }

  public promotePawn(fenChar: FENChar): void {
    if (this.promotionDialog.fromX == null || this.promotionDialog.fromY == null || this.promotionDialog.toX == null || this.promotionDialog.toY == null) return;
    const { fromX, fromY, toX, toY } = this.promotionDialog;
    switch (fenChar) {
      case FENChar.WhiteQueen:
      case FENChar.BlackQueen:
        this.chessBoard[toX][toY] = new Queen(this._playerColor); break;
      case FENChar.WhiteRook:
      case FENChar.BlackRook:
        this.chessBoard[toX][toY] = new Rook(this._playerColor); break;
      case FENChar.WhiteBishop:
      case FENChar.BlackBishop:
        this.chessBoard[toX][toY] = new Bishop(this._playerColor); break;
      case FENChar.WhiteKnight:
      case FENChar.BlackKnight:
        this.chessBoard[toX][toY] = new Knight(this._playerColor); break;
      case FENChar.WhiteKing:
      case FENChar.BlackKing:
        this.chessBoard[toX][toY] = new King(this._playerColor); break;
    }

    const piece = this.chessBoard[toX][toY]

    this.promotionDialog = { visible: false };
    this.updateBoard(fromX, fromY, toX, toY, piece!);
  }

  public isSquareDark(x: number, y: number): boolean {
    if (x % 2 == 0 && y % 2 == 0 || x % 2 == 1 && y % 2 == 1) {
      return true;
    }
    else {
      return false;
    }
  }

  public isSquareSelected(x: number, y: number): boolean {
    if (!this._selectedSquare.piece) {
      return false;
    }

    return this._selectedSquare.x == x && this._selectedSquare.y == y;
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this._piecePossibleMoves.some(coords => coords.x == x && coords.y == y);
  }

  public isSquareLastMove(x: number, y: number): boolean {
    if (!this.lastMove) {
      return false;
    }
    const { fromX, fromY, toX, toY } = this.lastMove;
    return x == fromX && y == fromY || x == toX && y == toY;
  }

  public isSquareChecked(x: number, y: number): boolean {
    return this.checkState.isInCheck && this.checkState.x == x && this.checkState.y == y;
  }

  private areCoordsValid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < 8 && y < 8;
  }

  public isInCheck(playerColor: Color, checkingCurrentPosition: boolean): boolean {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece: Piece | null = this.chessBoard[x][y];
        if (!piece || piece.color === playerColor) continue;

        for (const { x: dx, y: dy } of piece.directions) {
          let newX = x + dx, newY = y + dy;
          if (!this.areCoordsValid(newX, newY)) continue;

          if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
            if (piece instanceof Pawn && dy === 0) continue;
            const attackedPiece: Piece | null = this.chessBoard[newX][newY];
            if (attackedPiece instanceof King && attackedPiece.color === playerColor) {
              if (checkingCurrentPosition) this._checkState = { isInCheck: true, x: newX, y: newY };
              return true;
            }
          } else {
            while (this.areCoordsValid(newX, newY)) {
              const attackedPiece: Piece | null = this.chessBoard[newX][newY];
              if (attackedPiece instanceof King && attackedPiece.color === playerColor) {
                if (checkingCurrentPosition) this._checkState = { isInCheck: true, x: newX, y: newY };
                return true;
              }
              if (attackedPiece !== null) break;
              newX += dx; newY += dy;
            }
          }
        }
      }
    }
    if (checkingCurrentPosition) this._checkState = { isInCheck: false };
    return false;
  }

  private isPositionSafeAfterMove(fromX: number, fromY: number, newX: number, newY: number): boolean {
    const piece = this.chessBoard[fromX][fromY]; if (!piece) return false;
    const newPiece = this.chessBoard[newX][newY];
    if (newPiece && newPiece.color === piece.color) return false;

    this.chessBoard[fromX][fromY] = null;
    this.chessBoard[newX][newY] = piece;
    const isSafe = !this.isInCheck(piece.color, false);
    this.chessBoard[fromX][fromY] = piece;
    this.chessBoard[newX][newY] = newPiece;
    return isSafe;
  }

  private findPossibleMoves(): PossibleMoves {
    const possibleMoves: PossibleMoves = new Map<string, Coords[]>();
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = this.chessBoard[x][y];
        if (!piece || piece.color !== this._playerColor) continue;
        const piecePossibleMoves: Coords[] = [];

        for (const { x: dx, y: dy } of piece.directions) {
          let newX = x + dx, newY = y + dy;
          if (!this.areCoordsValid(newX, newY)) continue;
          let targetPiece = this.chessBoard[newX][newY];
          if (targetPiece && targetPiece.color === piece.color) continue;

          // Pawn-specific restrictions
          if (piece instanceof Pawn) {
            if ((dx === 2 || dx === -2) && (targetPiece || this.chessBoard[newX + (dx === 2 ? -1 : 1)][newY])) continue;
            if ((dx === 1 || dx === -1) && dy === 0 && targetPiece) continue;
            if ((dy === 1 || dy === -1) && (!targetPiece || piece.color === targetPiece.color)) continue;
          }

          if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
            if (this.isPositionSafeAfterMove(x, y, newX, newY)) piecePossibleMoves.push({ x: newX, y: newY });
          } else {
            while (this.areCoordsValid(newX, newY)) {
              targetPiece = this.chessBoard[newX][newY];
              if (targetPiece && targetPiece.color === piece.color) break;
              if (this.isPositionSafeAfterMove(x, y, newX, newY)) piecePossibleMoves.push({ x: newX, y: newY });
              if (targetPiece !== null) break;
              newX += dx; newY += dy;
            }
          }
        }

        //Check Castling
        if (piece instanceof King) {
          if (this.canCastle(piece, true))
            piecePossibleMoves.push({ x, y: 6 });

          if (this.canCastle(piece, false))
            piecePossibleMoves.push({ x, y: 2 });
        }

        //Check En Passant 
        if (piece instanceof Pawn && this.canCaptureEnPassant(piece, x, y) && this._lastMove) {
          piecePossibleMoves.push({ x: x + (piece.color === Color.White ? 1 : -1), y: this._lastMove.fromY });
        }

        if (piecePossibleMoves.length) possibleMoves.set(`${x},${y}`, piecePossibleMoves);
      }
    }
    return possibleMoves;
  }

  private canCastle(king: King, kingSideCastle: boolean): boolean {
    if (king.hasMoved) return false;

    const kingPositionX: number = king.color === Color.White ? 0 : 7;
    const kingPositionY: number = 4;
    const rookPositionX: number = kingPositionX;
    const rookPositionY: number = kingSideCastle ? 7 : 0;
    const rook: Piece | null = this.chessBoard[rookPositionX][rookPositionY];

    if (!(rook instanceof Rook) || rook.hasMoved || this._checkState.isInCheck) return false;

    const firstNextKingPositionY: number = kingPositionY + (kingSideCastle ? 1 : -1);
    const secondNextKingPositionY: number = kingPositionY + (kingSideCastle ? 2 : -2);

    if (this.chessBoard[kingPositionX][firstNextKingPositionY] || this.chessBoard[kingPositionX][secondNextKingPositionY]) return false;

    if (!kingSideCastle && this.chessBoard[kingPositionX][1]) return false;



    return this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, firstNextKingPositionY) &&
      this.isPositionSafeAfterMove(kingPositionX, kingPositionY, kingPositionX, secondNextKingPositionY);
  }

  private canCaptureEnPassant(pawn: Pawn, pawnX: number, pawnY: number): boolean {
    if (!this._lastMove) return false;
    const { piece, fromX, fromY, toX, toY } = this._lastMove;

    if (
      !(piece instanceof Pawn) ||
      pawn.color !== this._playerColor ||
      Math.abs(toX - fromX) !== 2 ||
      pawnX !== toX ||
      Math.abs(pawnY - toY) !== 1
    ) return false;

    const pawnNewPositionX: number = pawnX + (pawn.color === Color.White ? 1 : -1);
    const pawnNewPositionY: number = toY;

    this.chessBoard[toX][toY] = null;
    const isPositionSafe: boolean = this.isPositionSafeAfterMove(pawnX, pawnY, pawnNewPositionX, pawnNewPositionY);
    this.chessBoard[toX][toY] = piece;

    return isPositionSafe;
  }

  private castle(isKingSideCastle: boolean, rookPositionX: number): void {
    const rookPositionY = isKingSideCastle == true ? 7 : 0;
    const rook = this.chessBoard[rookPositionX][rookPositionY] as Rook;
    const rookNewPositionY = isKingSideCastle ? 5 : 3;
    this.chessBoard[rookPositionX][rookPositionY] = null;
    this.chessBoard[rookPositionX][rookNewPositionY] = rook;
    rook.hasMoved = true;
  }

}
