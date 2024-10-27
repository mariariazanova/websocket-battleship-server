import { Ship, ShipState } from '../interfaces/ship';

export function initializeShipStates(ships: Ship[]): ShipState[] {
  return ships.map((ship) => {
    const remainingCells = new Set<string>();
    const occupiedCells = new Set<string>();

    for (let i = 0; i < ship.length; i += 1) {
      const x = ship.position.x + (ship.direction ? 0 : i);
      const y = ship.position.y + (ship.direction ? i : 0);

      remainingCells.add(`${x},${y}`);
      occupiedCells.add(`${x},${y}`);
    }

    return { ...ship, remainingCells, occupiedCells };
  });
}
