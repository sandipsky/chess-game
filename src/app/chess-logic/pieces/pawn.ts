import { Color, Coords, FENChar } from "../models";
import { Piece } from "./piece";

export class Pawn extends Piece {
    private _hasMoved: boolean = false;

    protected override _FENChar: FENChar;

    protected override _directions: Coords[] = [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: -1 },
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);
        if (pieceColor == Color.White) {
            this._FENChar = FENChar.WhitePawn;
        }
        else {
            this._FENChar = FENChar.BlackPawn;
            this.setBlackPawnDirections();
        }
    }

    private setBlackPawnDirections(): void {
        this._directions = this._directions.map(({ x, y }) => ({ x: x * -1, y }));
    }

    public get hasMoved(): boolean {
        return this._hasMoved;
    }

    public set hasMoved(_) {
        this.hasMoved = true;
        this._directions = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: -1 },
        ]
        if(this.pieceColor == Color.Black) {
            this.setBlackPawnDirections();
        }
    }
}