import { getUserById } from '../functions/get-user-info';
import { getRoomUserByUserId } from '../functions/get-room-info';
import { attackResponse, turnResponse } from '../responses/game-responses';
import { initializeShipStates } from '../functions/initialize-ship-states';

export const addShips = (data: any): void => {
  const { gameId, ships: createdShips, indexPlayer } = JSON.parse(data);
  const roomUser = getRoomUserByUserId(indexPlayer);

  if (roomUser) {
    roomUser.ships = initializeShipStates(createdShips);
    roomUser.shots = new Set<string>();
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
      attack(JSON.stringify({ gameId, x,  y, indexPlayer  }));
      attackPositionFound = true;
      break;
    }
  }

  if (!attackPositionFound) {
    console.warn(`Unable to find empty cell after ${maxAttempts} attempts`);
  }
}
