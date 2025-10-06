import { Component } from '@angular/core';
import { CheckState, Color, Coords, FENChar, LastMove, pieceImagePaths, SafeSquares, Square } from "../models/models";
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
  private chessBoard: (Piece | null)[][];
  private _playerColor = Color.White;
  private _selectedSquare: Square = { piece: null };
  public safeSquares: SafeSquares;
  private _pieceSafeSquares: Coords[] = [];
  private _lastMove: LastMove | undefined;
  private _checkState: CheckState = { isInCheck: false };

  constructor() {
    this.chessBoard = [
      [new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
      new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White)
      ],
      Array(8).fill(null).map(() => new Pawn(Color.White)),
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      Array(8).fill(null).map(() => new Pawn(Color.Black)),
      [new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
      new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black)
      ],
    ]

    this.safeSquares = this.findSafeSquares();
  }

  public get playerColor(): Color {
    return this._playerColor;
  }

  public get chessBoardView(): (FENChar | null)[][] {
    return this.chessBoard.map(row => {
      return row.map(piece => piece instanceof Piece ? piece.FENChar : null);
    })
  }

  public get lastMove(): LastMove | undefined {
    return this._lastMove;
  }

  public get checkState(): CheckState {
    return this._checkState;
  }

  private unmarkPieceandSquares(): void {
    this._selectedSquare = { piece: null };
    this._pieceSafeSquares = [];
  }

  public selectPiece(x: number, y: number): void {
    const piece: FENChar | null = this.chessBoardView[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;
    //unselect piece if already selected
    if (this._selectedSquare.x == x && this._selectedSquare.y == y && !!this._selectedSquare.piece) {
      this.unmarkPieceandSquares();
      return;
    }

    this._selectedSquare = { piece, x, y };
    this._pieceSafeSquares = this.safeSquares.get(x + "," + y) || [];
  }

  public selectOrMove(x: number, y: number) {
    this.selectPiece(x, y);
    this.placePiece(x, y);
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece == piece.toUpperCase();
    return isWhitePieceSelected && this.playerColor == Color.Black || !isWhitePieceSelected && this.playerColor == Color.White;
  }

  public movePiece(prevX: number, prevY: number, newX: number, newY: number): void {
    if (!this.areCoordsValid(prevX, prevY) || !this.areCoordsValid(newX, newY)) return;

    const piece: Piece | null = this.chessBoard[prevX][prevY];

    if (!piece || piece.color !== this._playerColor) return;

    const pieceSafeSquares = this.safeSquares.get(prevX + "," + prevY);

    if (!pieceSafeSquares || !pieceSafeSquares.find(coords => coords.x == newX && coords.y == newY)) {
      throw new Error("Square is not Safe");
    }

    if ((piece instanceof Pawn || piece instanceof King || piece instanceof Rook) && !piece.hasMoved) {
      piece.hasMoved = true;
    }

    //update Board
    this.chessBoard[prevX][prevY] = null;
    this.chessBoard[newX][newY] = piece;


    this._lastMove = { prevX, prevY, currentX: newX, currentY: newY, piece };
    this._playerColor = this._playerColor == Color.White ? Color.Black : Color.White;
    this.isInCheck(this._playerColor, true);
    this.safeSquares = this.findSafeSquares();
  }

  public placePiece(newX: number, newY: number): void {
    if (!this._selectedSquare.piece) return;
    if (!this.isSquareSafeForSelectedPiece(newX, newY)) return;

    const { x: prevX, y: prevY } = this._selectedSquare;

    this.movePiece(Number(prevX), Number(prevY), newX, newY);
    this.unmarkPieceandSquares();
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
    return this._pieceSafeSquares.some(coords => coords.x == x && coords.y == y);
  }

  public isSquareLastMove(x: number, y: number): boolean {
    if (!this.lastMove) {
      return false;
    }
    const { prevX, prevY, currentX, currentY } = this.lastMove;
    return x == prevX && y == prevY || x == currentX && y == currentY;
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

  private isPositionSafeAfterMove(prevX: number, prevY: number, newX: number, newY: number): boolean {
    const piece = this.chessBoard[prevX][prevY]; if (!piece) return false;
    const newPiece = this.chessBoard[newX][newY];
    if (newPiece && newPiece.color === piece.color) return false;

    this.chessBoard[prevX][prevY] = null;
    this.chessBoard[newX][newY] = piece;
    const isSafe = !this.isInCheck(piece.color, false);
    this.chessBoard[prevX][prevY] = piece;
    this.chessBoard[newX][newY] = newPiece;
    return isSafe;
  }

  private findSafeSquares(): SafeSquares {
    const safeSquares: SafeSquares = new Map<string, Coords[]>();
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = this.chessBoard[x][y];
        if (!piece || piece.color !== this._playerColor) continue;
        const pieceSafeSquares: Coords[] = [];

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
            if (this.isPositionSafeAfterMove(x, y, newX, newY)) pieceSafeSquares.push({ x: newX, y: newY });
          } else {
            while (this.areCoordsValid(newX, newY)) {
              targetPiece = this.chessBoard[newX][newY];
              if (targetPiece && targetPiece.color === piece.color) break;
              if (this.isPositionSafeAfterMove(x, y, newX, newY)) pieceSafeSquares.push({ x: newX, y: newY });
              if (targetPiece !== null) break;
              newX += dx; newY += dy;
            }
          }
        }

        if (pieceSafeSquares.length) safeSquares.set(`${x},${y}`, pieceSafeSquares);
      }
    }
    return safeSquares;
  }
}
