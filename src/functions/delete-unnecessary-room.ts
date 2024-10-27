import { rooms } from '../database/rooms-database';

export const deleteUnnecessaryRoom = (userName: string): void => {
  const unnecessaryRoomIndex = rooms.findIndex(
    (room) =>
      room.roomUsers.length === 1 &&
      room.roomUsers.find((user) => user.name === userName),
  );

  if (unnecessaryRoomIndex !== -1) {
    rooms.splice(unnecessaryRoomIndex, 1);
  }
};
