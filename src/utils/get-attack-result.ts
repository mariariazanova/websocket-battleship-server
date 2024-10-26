import { AttackResult } from "../enums/attack-result";
import {rooms} from "../database/rooms-database";
import {ShipsPerUser} from "../interfaces/ship";

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
