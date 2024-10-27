import { Room } from '../interfaces/room';
import {botUser, getUserById} from '../database/users-database';
import { rooms } from '../database/rooms-database';
import { isUserPlayingInGame } from '../utils/is-user-playing';
import {wsClients} from "../database/ws-clients-database";

export const createRoom = (roomId: string, userId: string): void => {
  console.log(wsClients.length, wsClients[0].name, wsClients[0].ws.readyState, wsClients[1]?.name);
  const currentUser = getUserById(userId);
  const isUserPlaying = isUserPlayingInGame(userId);

  if (currentUser && !isUserPlaying) {
    const room: Room = {
      roomId,
      roomUsers: [{ name: currentUser.name, index: <number>currentUser.index, userId }],
    };

    if (!rooms.filter(room => room.roomUsers.some(user => user.name === currentUser.name)).length) {
      rooms.push(room);
      console.log('ROOMS', room);
    }
  }
}

export function addUserToRoom(data: any, userId: string): void {
  const { indexRoom } = JSON.parse(data);
  const currentUser = getUserById(userId) || botUser;
  console.log('botUser', currentUser);
  const isUserPlaying = isUserPlayingInGame(userId);

  if (currentUser && !isUserPlaying) {
    const roomUser = {
      name: currentUser.name,
      index: <number>currentUser.index,
      userId,
    };
    const room = rooms.find(item => item.roomId === indexRoom);
    console.log(roomUser, room);

    if (room && room.roomUsers && room.roomUsers.length === 1) {
      room.roomUsers.push(roomUser);
      console.log(rooms);

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
