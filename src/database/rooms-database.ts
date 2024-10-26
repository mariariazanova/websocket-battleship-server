import { Room } from '../interfaces/room';
import {ShipsPerUser} from "../interfaces/ship";
import {getUserById, getUserByName} from "./users-database";

export const rooms: Room[] = [];

export const getRoomByUserName = (userName: string): Room | undefined => rooms.find(room => room.roomUsers.some(roomUser => roomUser.name === userName));
export const getRoomByUserId = (userId: string): Room | undefined => {
    const user = getUserById(userId);

    if (user) {
      return rooms.find(room => room.roomUsers.some(roomUser => roomUser.name === user?.name));
    }

    return undefined;
}

// const room = user && rooms.find(room => room.roomUsers.some(roomUser => roomUser.name === user.name));
export const getRoomUsers = (room: Room): ShipsPerUser[] => room.roomUsers;
export const getRoomUsersByUserName = (userName: string): ShipsPerUser[] | undefined => getRoomByUserName(userName)?.roomUsers;
export const getRoomUsersByUserId = (userId: string): ShipsPerUser[] | undefined => getRoomByUserId(userId)?.roomUsers;
// const roomUsers = room?.roomUsers || [];
export const getRoomUserByUserName = (userName: string): ShipsPerUser | undefined => {
  const roomUsers = getRoomUsersByUserName(userName);
  const user = getUserByName(userName);

        // Ensure roomUsers is an array and user is defined before trying to find
  if (roomUsers && user) {
    return roomUsers.find(roomUser => roomUser.userId === user.id);
  }

  return undefined; // Return undefined if either roomUsers or user is not found
    // getRoomUsersByUserName(userName)?.find(roomUser => roomUser.userId === getUserByName(userName)?.id);
}

export const getRoomUserByUserId = (userId: string, isUser = true): ShipsPerUser | undefined => {
  const roomUsers = getRoomUsersByUserId(userId);

  if (roomUsers) {
    return roomUsers.find(roomUser => isUser ? roomUser.userId === userId : roomUser.userId !== userId);
  }

  return undefined;
}
