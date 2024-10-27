import { ShipType } from '../enums/ship-type';

export interface Position {
  x: number;
  y: number;
}

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface ShipsPerUser {
  userId: string;
  name?: string;
  index: number;
  ships?: ShipState[];
  shots?: Set<string>;
}

export interface ShipState extends Ship {
  remainingCells: Set<string>;
  occupiedCells?: Set<string>;
}
