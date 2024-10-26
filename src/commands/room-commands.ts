import { Room } from '../interfaces/room';
import { getUserById } from '../database/users-database';
import { rooms } from '../database/rooms-database';
import { isUserPlayingInGame } from '../utils/is-user-playing';

export const createRoom = (roomId: string, userId: string): void => {
  const currentUser = getUserById(userId);
  const isUserPlaying = isUserPlayingInGame(userId);

  if (currentUser && !isUserPlaying) {
    const room: Room = {
      roomId,
      roomUsers: [{ name: currentUser.name, index: <number>currentUser.index, userId }],
    };

    if (!rooms.filter(room => room.roomUsers.some(user => user.name === currentUser.name)).length) {
      rooms.push(room);
    }
  }
}

export function addUserToRoom(data: any, userId: string): void {
  const { indexRoom } = JSON.parse(data);
  const currentUser = getUserById(userId);
  const isUserPlaying = isUserPlayingInGame(userId);

  if (currentUser && !isUserPlaying) {
    const roomUser = {
      name: currentUser.name,
      index: <number>currentUser.index,
      userId,
    };
    const room = rooms.find(item => item.roomId === indexRoom);

    if (room && room.roomUsers && room.roomUsers.length === 1) {
      room.roomUsers.push(roomUser);

      deleteUnnecessaryRoom(currentUser.name);
    }
  }
}

function deleteUnnecessaryRoom(userName: string): void {
  const unnecessaryRoomIndex = rooms.findIndex(room => room.roomUsers.length === 1 && room.roomUsers.find(user => user.name === userName));

  if (unnecessaryRoomIndex !== -1) {
    rooms.splice(unnecessaryRoomIndex, 1);
  }
}
