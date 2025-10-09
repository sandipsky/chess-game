import { Color, Coords, FENChar } from "../../models/models";
import { Piece } from "../piece";

export class Queen extends Piece {
    protected override _FENChar: FENChar;

    protected override _directions: Coords[] = [
        {x: 0, y: 1},
        {x: 0, y: -1},
        {x: 1, y: 0},
        {x: -1, y: 0},
        {x: 1, y: 1},
        {x: 1, y: -1},
        {x: -1, y: 1},
        {x: -1, y: -1},
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);  
        if(pieceColor == Color.White) {
            this._FENChar = FENChar.WhiteQueen;
        }
        else {
            this._FENChar = FENChar.BlackQueen;
        }
    }
}