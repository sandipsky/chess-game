import { Piece } from "../utils/piece";


export enum Color {
    White,
    Black
}

export type Coords = {
    x: number;
    y: number;
}

export enum FENChar {
    WhitePawn = "P",
    WhiteKnight = "N",
    WhiteBishop = "B",
    WhiteRook = "R",
    WhiteQueen = "Q",
    WhiteKing = "K",
    BlackPawn = "p",
    BlackKnight = "n",
    BlackBishop = "b",
    BlackRook = "r",
    BlackQueen = "q",
    BlackKing = "k"
}

// export const pieceImagePaths: Readonly<Record<FENChar, string>> = {
//     [FENChar.WhitePawn]: "assets/pieces/white_pawn.svg",
//     [FENChar.WhiteKnight]: "assets/pieces/white_knight.svg",
//     [FENChar.WhiteRook]: "assets/pieces/white_rook.svg",
//     [FENChar.WhiteBishop]: "assets/pieces/white_bishop.svg",
//     [FENChar.WhiteQueen]: "assets/pieces/white_queen.svg",
//     [FENChar.WhiteKing]: "assets/pieces/white_king.svg",
//     [FENChar.BlackPawn]: "assets/pieces/black_pawn.svg",
//     [FENChar.BlackKnight]: "assets/pieces/black_knight.svg",
//     [FENChar.BlackRook]: "assets/pieces/black_rook.svg",
//     [FENChar.BlackBishop]: "assets/pieces/black_bishop.svg",
//     [FENChar.BlackQueen]: "assets/pieces/black_queen.svg",
//     [FENChar.BlackKing]: "assets/pieces/black_king.svg",
// }

export const pieceImagePaths: Readonly<Record<FENChar, string>> = {
    [FENChar.WhitePawn]: "assets/pieces1/wp.png",
    [FENChar.WhiteKnight]: "assets/pieces1/wn.png",
    [FENChar.WhiteRook]: "assets/pieces1/wr.png",
    [FENChar.WhiteBishop]: "assets/pieces1/wb.png",
    [FENChar.WhiteQueen]: "assets/pieces1/wq.png",
    [FENChar.WhiteKing]: "assets/pieces1/wk.png",
    [FENChar.BlackPawn]: "assets/pieces1/bp.png",
    [FENChar.BlackKnight]: "assets/pieces1/bn.png",
    [FENChar.BlackRook]: "assets/pieces1/br.png",
    [FENChar.BlackBishop]: "assets/pieces1/bb.png",
    [FENChar.BlackQueen]: "assets/pieces1/bq.png",
    [FENChar.BlackKing]: "assets/pieces1/bk.png",
}

export type Square = {
    piece: Piece | null;
    x?: number;
    y?: number;
}

export type PossibleMoves = Map<string, Coords[]>;


export type LastMove = {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    piece: Piece;
}

type KingChecked = {
    isInCheck: true;
    x: number;
    y: number;
}

type KingNotChecked = {
    isInCheck: false;
}

export type CheckState = KingChecked | KingNotChecked;