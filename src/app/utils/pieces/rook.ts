import { Color, Coords, FENChar } from "../../models/models";
import { Piece } from "../piece";

export class Rook extends Piece {
    private _hasMoved: boolean = false;    

    protected override _FENChar: FENChar;

    protected override _directions: Coords[] = [
        {x: 0, y: 1},
        {x: 0, y: -1},
        {x: 1, y: 0},
        {x: -1, y: 0},
    ];

    protected override _points = 5;

    constructor(private pieceColor: Color) {
        super(pieceColor);  
        if(pieceColor == Color.White) {
            this._FENChar = FENChar.WhiteRook;
        }
        else {
            this._FENChar = FENChar.BlackRook;
        }
    }

    public get hasMoved(): boolean {
        return this._hasMoved;
    }

    public set hasMoved(_) {
        this._hasMoved = true;
    }
}