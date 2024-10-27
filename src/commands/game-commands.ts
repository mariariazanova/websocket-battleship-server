import { getUserById } from '../functions/get-user-info';
import { getRoomUserByUserId } from '../functions/get-room-info';
import { attackResponse, turnResponse } from '../responses/game-responses';
import { initializeShipStates } from '../functions/initialize-ship-states';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addShips = (data: any): void => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { gameId, ships: createdShips, indexPlayer } = JSON.parse(data);
  const roomUser = getRoomUserByUserId(indexPlayer);

  if (roomUser) {
    roomUser.ships = initializeShipStates(createdShips);
    roomUser.shots = new Set<string>();
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const attack = (data: any): void => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const randomAttack = (data: any): void => {
  const { gameId, indexPlayer } = JSON.parse(data);
  const maxAttempts = 100;
  const roomUser = getRoomUserByUserId(indexPlayer);

  let x: number;
  let y: number;
  let attackPositionFound = false;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);

    const coordinates = `${x},${y}`;
    const attackedCells = roomUser?.shots;

    if (attackedCells && !attackedCells.has(coordinates)) {
      attack(JSON.stringify({ gameId, x, y, indexPlayer }));
      attackPositionFound = true;
      break;
    }
  }

  if (!attackPositionFound) {
    // eslint-disable-next-line no-console
    console.warn(`Unable to find empty cell after ${maxAttempts} attempts`);
  }
};
