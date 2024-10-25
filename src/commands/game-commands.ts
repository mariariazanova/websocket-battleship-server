import { Command } from '../enums/command';
import {getUserById, getUserByIndex, getUserByName} from '../database/users-database';
import { ships } from '../database/ships-database';
import { initializeShipStates } from './responses';
import { generateUniqueId } from '../utils/generate-uuid';
import { games } from '../database/game-database';
import { rooms } from '../database/rooms-database';
import { wsClients } from '../database/ws-clients-database';
import { getAttackResult } from '../utils/get-attack-result';
import { attackResponse } from '../responses/game-responses';



export const addShips = (data: any): void => {
  const { gameId, ships: createdShips, indexPlayer } = JSON.parse(data);

  ships.push({
    userId: indexPlayer,
    gameId,
    ships: initializeShipStates(createdShips),
  });
};

export const attack = (data: any): void => {
  const { gameId, indexPlayer, x, y } = JSON.parse(data);
  // console.log('attack', indexPlayer);

  const user = getUserById(indexPlayer);
  console.log(user);
  if (user && user.isTurn) {
      attackResponse(indexPlayer, x, y);
  }

  // getAttackResult(indexPlayer, x, y);
};

// export const randomAttack = (data: any): void => {
//     console.log('randomAttack');
//     const { gameId, indexPlayer } = JSON.parse(data);
//     attack(
//         JSON.stringify({
//             gameId,
//             x: Math.floor(Math.random() * 10),
//             y: Math.floor(Math.random() * 10),
//             indexPlayer,
//         })
//     );
// }

const attackedCells = new Set<string>();

export const randomAttack = (data: any): void => {
    console.log('randomAttack');
    const { gameId, indexPlayer } = JSON.parse(data);

    // Generate a random attack position that has not been shot yet
    let x, y;
    let attackPositionFound = false;
    const maxAttempts = 100; // Limit attempts to prevent infinite loops

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);

        // Check if this cell has already been attacked
        if (!attackedCells.has(`${x},${y}`)) {
            attackedCells.add(`${x},${y}`); // Mark this cell as attacked
            attack(
                JSON.stringify({
                    gameId,
                    x,
                    y,
                    indexPlayer,
                })
            );
            attackPositionFound = true;
            break; // Exit the loop after a successful attack
        }
    }

    if (!attackPositionFound) {
        console.warn(`Unable to find an unshot cell after ${maxAttempts} attempts.`);
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

