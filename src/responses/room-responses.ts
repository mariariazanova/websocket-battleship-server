import { Room } from '../interfaces/room';
import { rooms } from '../database/rooms-database';
import { wsClients } from '../database/ws-clients-database';
import { getUserById } from '../database/users-database';
import { isUserPlayingInGame } from '../utils/is-user-playing';
import { sendResponse } from '../utils/send-response';
import { Command } from '../enums/command';

export const updateRoomResponse = (): void => {
  const getRoomsWithOneAnotherUser = (userName: string): Room[] => rooms.filter(room => (room.roomUsers.length === 1 && room.roomUsers.every(user => user.name !== userName)));

  wsClients.forEach(client => {
    const currentUser = getUserById(client.id);

    if (currentUser) {
      const isUserPlaying = isUserPlayingInGame(currentUser.id);

      !isUserPlaying && sendResponse(client.id, Command.UPDATE_ROOM, getRoomsWithOneAnotherUser(currentUser.name));
      // !isUserPlaying && sendResponse(client.ws, Command.UPDATE_ROOM, getRoomsWithOneUser(currentUser.name));
    }
  });
};
