import { ShipType } from '../enums/ship-type';

export interface Ship {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
    type: ShipType; // "small" | "medium" | "large" | "huge";
}

export interface ShipsPerUser {
    userId: string;
    name?: string;
    index: number;
    // gameId: number;
    ships?: ShipState[];
    shots?: Set<string>;
}

export interface ShipState extends Ship {
    remainingCells: Set<string>;
}
