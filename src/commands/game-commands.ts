import { getUserById, getUserByIndex, getUserByName} from '../database/users-database';
import { initializeShipStates } from './responses';
import {getRoomByUserId, getRoomUserByUserId, rooms } from '../database/rooms-database';
import { attackResponse, turnResponse } from '../responses/game-responses';

export const addShips = (data: any): void => {
  const { gameId, ships: createdShips, indexPlayer } = JSON.parse(data);
  const room = rooms.find((room) =>room.gameId === gameId);

  if (room) {
    const roomUser = getRoomUserByUserId(indexPlayer);

    if (roomUser) {
      roomUser.ships = initializeShipStates(createdShips);
      roomUser.shots = new Set<string>();
    }
  }
};

export const attack = (data: any): void => {
  const { gameId, indexPlayer, x, y } = JSON.parse(data);
  const shotCell = `${x},${y}`;

  const user = getUserById(indexPlayer);
  const roomUser = getRoomUserByUserId(indexPlayer);

  if (user && user.isTurn && !roomUser?.shots?.has(shotCell)) {
    roomUser?.shots?.add(shotCell);

    attackResponse(indexPlayer, x, y);
  } else if (user && user.isTurn && roomUser?.shots?.has(shotCell)) {
    turnResponse(indexPlayer);
  }
};

export const randomAttack = (data: any): void => {
  const { gameId, indexPlayer } = JSON.parse(data);
  const maxAttempts = 100;
  const roomUser = getRoomUserByUserId(indexPlayer);

  let x: number;
  let y: number;
  let attackPositionFound = false;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);

    const coordinates = `${x},${y}`;
    const attackedCells= roomUser?.shots;

    if (attackedCells && !attackedCells.has(coordinates)) {
      attackedCells.add(coordinates);
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

