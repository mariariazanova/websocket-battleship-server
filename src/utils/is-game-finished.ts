import { ships } from '../database/ships-database';

export const isGameFinished = (enemyUserId: number | string): boolean => {
  const enemyShips = ships.find(shipsPerUser => shipsPerUser.userId === enemyUserId)?.ships;

  return !!enemyShips && enemyShips.every(ship => ship.remainingCells.size === 0);
}
