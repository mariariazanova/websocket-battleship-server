import { ships } from '../database/ships-database';
import { AttackResult } from "../enums/attack-result";

export const getAttackResult = (x: number, y: number, userId: number): AttackResult => {
  const enemyShips = ships.find(shipsPerUser => shipsPerUser.userId !== userId)?.ships ?? [];
  const coordinate = `${x},${y}`;

  for (const ship of enemyShips) {
    if (ship.remainingCells.has(coordinate)) {
      ship.remainingCells.delete(coordinate);
            console.log(ship.remainingCells);

      if (ship.remainingCells.size === 0) {
        return AttackResult.Killed;
      } else {
        return AttackResult.Shot;
      }
    }
  }

  return AttackResult.Miss;
}
