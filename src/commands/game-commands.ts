import { getUserById, getUserByIndex, getUserByName} from '../database/users-database';
import { initializeShipStates } from './responses';
import {getRoomByUserId, getRoomUserByUserId, rooms } from '../database/rooms-database';
import { attackResponse, turnResponse } from '../responses/game-responses';

export const addShips = (data: any): void => {
  console.log("ADD SHIPS", data);
  const { gameId, ships: createdShips, indexPlayer } = JSON.parse(data);
  const room = rooms.find((room) =>room.gameId === gameId);
  console.log(room);

  if (room) {
    const roomUser = room.roomUsers?.find(user => user.userId === indexPlayer);
    console.log(roomUser);

    if (roomUser) {
      roomUser.ships = initializeShipStates(createdShips);
      roomUser.shots = new Set<string>();
    }
  }
};

export const attack = (data: any): void => {
  console.log('Attack', data);
  const { gameId, indexPlayer, x, y } = JSON.parse(data);
  const shotCell = `${x},${y}`;

  const user = getUserById(indexPlayer);
  const roomUser = getRoomUserByUserId(indexPlayer);
  console.log(user, roomUser);

  if (user && user.isTurn && !roomUser?.shots?.has(shotCell)) {
    roomUser?.shots?.add(shotCell);
    console.log('1');

    attackResponse(indexPlayer, x, y);
  } else if (user && user.isTurn && roomUser?.shots?.has(shotCell)) {
    console.log('2');
    turnResponse(indexPlayer);
  }
};

export const randomAttack = (data: any): void => {
  console.log('RANDOM ATTACK');
  const { gameId, indexPlayer } = JSON.parse(data);
  const maxAttempts = 100;
  const roomUser = getRoomUserByUserId(indexPlayer);
  console.log(gameId, indexPlayer, roomUser);

  let x: number;
  let y: number;
  let attackPositionFound = false;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);

    const coordinates = `${x},${y}`;
    const attackedCells= roomUser?.shots;
    console.log(roomUser, roomUser?.shots);

    if (attackedCells && !attackedCells.has(coordinates)) {
      attack(JSON.stringify({ gameId, x,  y, indexPlayer  }));
      attackPositionFound = true;
      break;
    }
  }

  if (!attackPositionFound) {
    console.warn(`Unable to find empty cell after ${maxAttempts} attempts`);
  }
}

export const singlePlay = (data: any): void => {
    console.log('single play', data);
    // const { gameId, indexPlayer, x, y } = JSON.parse(data);

    // console.log(JSON.parse(data));

    // attackResponse(indexPlayer, x, y);

    // registerUser(data, wsClient, userId);
    // updateRoomResponse();
    // updateWinnersResponse();
};

