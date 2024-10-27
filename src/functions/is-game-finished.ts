import { rooms } from '../database/rooms-database';
import { ShipsPerUser } from '../interfaces/ship';

export const isGameFinished = (enemyUserId: string): boolean => {
  const room = rooms.find((room) =>
    room.roomUsers.some((user) => user.userId === enemyUserId),
  );
  const roomUsers = room?.roomUsers;
  const roomUser = (<ShipsPerUser[]>roomUsers).find(
    (user) => user.userId === enemyUserId,
  );
  const enemyShips = roomUser?.ships;

  return (
    !!enemyShips && enemyShips.every((ship) => ship.remainingCells.size === 0)
  );
};
