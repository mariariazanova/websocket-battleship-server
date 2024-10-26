import { AttackResultState } from '../enums/attack-result-state';
import { rooms } from '../database/rooms-database';
import { ShipsPerUser } from '../interfaces/ship';
import { AttackResult } from '../interfaces/attack-result';

export const getAttackResult = (x: number, y: number, userId: string): AttackResult => {
  const room = rooms.find(room => room.roomUsers.some(user => user.userId === userId));
  const roomUsers = room?.roomUsers;
  const roomUser = (<ShipsPerUser[]>roomUsers).find(user => user.userId !== userId);
  const enemyShips = roomUser?.ships || [];
  // const enemyShips = ships.find(shipsPerUser => shipsPerUser.userId !== userId)?.ships ?? [];
  const coordinate = `${x},${y}`;

  for (const ship of enemyShips) {
    if (ship.remainingCells.has(coordinate)) {
      ship.remainingCells.delete(coordinate);
      // console.log(ship.remainingCells);

      if (ship.remainingCells.size === 0) {
        const surroundingCells = getSurroundingCells(ship.occupiedCells);

        return { attackResultStatus: AttackResultState.Killed, surroundingCells };
      } else {
        return { attackResultStatus: AttackResultState.Shot };
      }
    }
  }

  return { attackResultStatus: AttackResultState.Miss };
}

const getSurroundingCells = (occupiedCells: Set<string>): string[] => {
  const surroundingCells: Set<string> = new Set();

  occupiedCells.forEach(cell => {
    const [x, y] = cell.split(',').map(Number);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // Skip the cell itself

        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newY >= 0 && !occupiedCells.has(`${newX},${newY}`)) {
          surroundingCells.add(`${newX},${newY}`);
        }
      }
    }
  });

  return Array.from(surroundingCells);
};

