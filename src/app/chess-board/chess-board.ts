import { Component } from '@angular/core';
import { Color, FENChar, pieceImagePaths } from "../chess-logic/models";
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
  }

  public get playerColor(): Color {
    return this._playerColor;
  }

  public get chessBoardView(): (FENChar | null)[][] {
    return this.chessBoard.map(row => {
      return row.map(piece => piece instanceof Piece ? piece.FENChar : null);
    })
  }

  public isSquareDark(x: number, y: number): boolean {
    if (x % 2 == 0 && y % 2 == 0 || x % 2 == 1 && y % 2 == 1) {
      return true;
    }
    else {
      return false;
    }
  }
}
