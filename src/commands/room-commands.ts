import { Room } from '../interfaces/room';
import { getUserById, getUserByName } from '../database/users-database';
import { rooms } from '../database/rooms-database';
import { UserWithIndex } from '../interfaces/user';
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
  // console.log(currentUser, isUserPlaying);

  if (currentUser && !isUserPlaying) {
    const roomUser = {
      name: currentUser.name,
      index: <number>currentUser.index,
      userId,
    };
    const room = rooms.find(item => item.roomId === indexRoom);
    // console.log(room);

    if (room && room.roomUsers && room.roomUsers.length === 1) {
      room.roomUsers.push(roomUser);
      // room.roomUsers.forEach(user => {
      //   const foundUser = getUserByName(user.name);
      //   console.log(foundUser);
      //
      //   if (foundUser) {
      //     foundUser.isPlaying = true;
      //   }
      // });
      // console.log(room);

      // delete room created by user
      deleteUnnecessaryRoom(currentUser.name);
    }
  }
}

function deleteUnnecessaryRoom(userName: string): void {
    // console.log(userName);
  const unnecessaryRoomIndex = rooms.findIndex(room => room.roomUsers.length === 1 && room.roomUsers.find(user => user.name === userName));

  // console.log(rooms, unnecessaryRoomIndex);

  if (unnecessaryRoomIndex !== -1) {
    rooms.splice(unnecessaryRoomIndex, 1);
    // console.log(rooms);
  }
}
