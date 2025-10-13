import { Color, Coords, FENChar } from "../models/models";

export abstract class Piece {
    protected abstract _FENChar: FENChar;

    protected abstract _directions: Coords[];

    protected abstract _points: number;

    constructor(private _color: Color) {}

    public get FENChar(): FENChar {
        return this._FENChar;
    }

    public get directions(): Coords[] {
        return this._directions;
    }

    public get color(): Color {
        return this._color;
    }

    public get points(): number {
        return this._points;
    }
}

