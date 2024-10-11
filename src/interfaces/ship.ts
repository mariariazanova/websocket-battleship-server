import {ShipType} from "../enums/ship-type";

export interface Ship {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
    type: ShipType; // "small" | "medium" | "large" | "huge";
}

export interface ShipsPerUser {
    userId: number;
    ships: ShipState[];
}

export interface ShipState extends Ship {
    remainingCells: Set<string>;
}
