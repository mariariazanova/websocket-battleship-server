import { Room } from '../interfaces/room';
import { ShipsPerUser } from '../interfaces/ship';
import { rooms } from '../database/rooms-database';

export const getRoomByUserName = (userName: string): Room | undefined =>
  rooms.find((room) =>
    room.roomUsers.some((roomUser) => roomUser.name === userName),
  );
export const getRoomByUserId = (userId: string): Room | undefined =>
  rooms.find((room) =>
    room.roomUsers.some((roomUser) => roomUser.userId === userId),
  );

export const getRoomUsers = (room: Room): ShipsPerUser[] => room.roomUsers;
export const getRoomUsersByUserId = (
  userId: string,
): ShipsPerUser[] | undefined => getRoomByUserId(userId)?.roomUsers;

export const getRoomUserByUserId = (
  userId: string,
  isUser = true,
): ShipsPerUser | undefined => {
  const roomUsers = getRoomUsersByUserId(userId);

  if (roomUsers) {
    return roomUsers.find((roomUser) =>
      isUser ? roomUser.userId === userId : roomUser.userId !== userId,
    );
  }

  return undefined;
};
