import { Component } from '@angular/core';
import { Color, Coords, FENChar, pieceImagePaths, SafeSquares, Square } from "../chess-logic/models";
import { Bishop } from "../chess-logic/pieces/bishop";
import { King } from "../chess-logic/pieces/king";
import { Knight } from "../chess-logic/pieces/knight";
import { Pawn } from "../chess-logic/pieces/pawn";
import { Piece } from "../chess-logic/pieces/piece";
import { Queen } from "../chess-logic/pieces/queen";
import { Rook } from "../chess-logic/pieces/rook";

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

  constructor() {
    this.chessBoard = [
      [new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
      new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White)
      ],
      [
        new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White)
      ],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      [null, null, null, null, null, null, null, null,],
      [
        new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black)
      ],
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



    this._playerColor = this._playerColor == Color.White ? Color.Black : Color.White;
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

  private areCoordsValid(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < 8 && y < 8;
  }

  public isInCheck(playerColor: Color): boolean {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece: Piece | null = this.chessBoard[x][y];
        if (!piece || piece.color == playerColor) {
          continue;
        }

        for (const { x: dx, y: dy } of piece.directions) {
          let newX: number = x + dx;
          let newY: number = y + dy;

          if (!this.areCoordsValid(newX, newY)) {
            continue;
          }

          if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
            //pawn only attack dialognally
            if (piece instanceof Pawn && dy == 0) {
              continue;
            }

            const attackedPiece: Piece | null = this.chessBoard[newX][newY];

            if (attackedPiece instanceof King && attackedPiece.color == playerColor) {
              return true;
            }
          }
          else {
            while (this.areCoordsValid(newX, newY)) {
              const attackedPiece: Piece | null = this.chessBoard[newX][newY];

              if (attackedPiece instanceof King && attackedPiece.color == playerColor) {
                return true;
              }

              if (attackedPiece !== null) {
                break;
              }

              newX += dx;
              newY += dy;
            }
          }
        }
      }
    }

    return false;
  }

  private isPositionSafeAfterMove(piece: Piece, prevX: number, prevY: number, newX: number, newY: number): boolean {
    const newPiece: Piece | null = this.chessBoard[newX][newY];
    //we cant put piece on a square that already contains piece of same square
    if (newPiece && newPiece.color == piece.color) {
      return false;
    }

    //simulate Postition
    this.chessBoard[prevX][prevY] = null;
    this.chessBoard[newX][newY] = piece;

    const isPositionSafe: boolean = !this.isInCheck(piece.color);

    //restore position
    this.chessBoard[prevX][prevY] = piece;
    this.chessBoard[newX][newY] = newPiece;

    return isPositionSafe;
  }

  private findSafeSquares(): SafeSquares {
    const safeSquares: SafeSquares = new Map<string, Coords[]>();

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece: Piece | null = this.chessBoard[x][y];

        if (!piece || piece.color != this._playerColor) {
          continue;
        }

        const pieceSafeSquares: Coords[] = [];

        for (const { x: dx, y: dy } of piece.directions) {
          let newX: number = x + dx;
          let newY: number = y + dy;

          if (!this.areCoordsValid(newX, newY)) {
            continue;
          }

          let newPiece: Piece | null = this.chessBoard[newX][newY];

          //cannot put piece that already contains our piece
          if (newPiece && newPiece.color == piece.color) {
            continue;
          }

          //need to restrict pawn move in certain directions 
          if (piece instanceof Pawn) {
            //cant move pawn 2 squares straight if there is piece infront of it
            if (dx == 2 || dx == -2) {
              if (newPiece) {
                continue;
              }

              if (this.chessBoard[newX + (dx == 2 ? -1 : 1)][newY]) {
                continue;
              }
            }

            //cant move pawn one square straight if piece is infront of it 
            if ((dx == 1 || dx == -1) && dy == 0 && newPiece) {
              continue;
            }

            //cant move pawn diagonally if there is no piece or piece has same color as pawn
            if ((dy == 1 || dy == -1) && (!newPiece || piece.color == newPiece.color)) {
              continue;
            }

          }

          if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
            if (this.isPositionSafeAfterMove(piece, x, y, newX, newY)) {
              pieceSafeSquares.push({ x: newX, y: newY })
            }
          }
          else {
            while (this.areCoordsValid(newX, newY)) {
              newPiece = this.chessBoard[newX][newY];

              if (newPiece && newPiece.color == piece.color) {
                break;
              }

              if (this.isPositionSafeAfterMove(piece, x, y, newX, newY)) {
                pieceSafeSquares.push({ x: newX, y: newY })
              }

              if (newPiece != null) {
                break;
              }

              newX += dx;
              newY += dy;
            }
          }
        }

        if (pieceSafeSquares.length) {
          safeSquares.set(x + ',' + y, pieceSafeSquares)
        }

      }
    }

    return safeSquares;
  }
}
