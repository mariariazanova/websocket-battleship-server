import { Command } from '../enums/command';
import {getUserById, getUserByIndex, getUserByName} from '../database/users-database';
import { initializeShipStates } from './responses';
import { rooms } from '../database/rooms-database';
import { wsClients } from '../database/ws-clients-database';
import { getAttackResult } from '../utils/get-attack-result';
import {attackResponse, turnResponse} from '../responses/game-responses';
import {AttackResultState} from "../enums/attack-result-state";



export const addShips = (data: any): void => {
  const { gameId, ships: createdShips, indexPlayer } = JSON.parse(data);

  const room = rooms.find((room) =>room.gameId === gameId);

  if (room) {
      const roomUser = room?.roomUsers.find(user => user.userId === indexPlayer);

      if (roomUser) {
          roomUser.ships = initializeShipStates(createdShips);
          roomUser.shots = new Set<string>();
      }
  }
};

export const attack = (data: any): void => {
  const { gameId, indexPlayer, x, y } = JSON.parse(data);
  // console.log('attack', indexPlayer);
    const shotCell = `${x},${y}`;

  const user = getUserById(indexPlayer);
    const room = user && rooms.find(room => room.roomUsers.some(roomUser => roomUser.name === user.name));
    const roomUsers = room?.roomUsers || [];
    const roomUser = roomUsers.find((roomUser) => roomUser.userId == user?.id)

  // console.log(user);
  if (user && user.isTurn && !roomUser?.shots?.has(shotCell)) {
      // const room = rooms.find(room => room.roomUsers.some(roomUser => roomUser.name === user.name));
      // const roomUsers = room?.roomUsers || [];
      // const roomUser = roomUsers.find((roomUser) => roomUser.userId == user.id)
          // roomUsers?.find((roomUser) => roomUser.userId === user.id);

      // if (roomUser?.shots?.has(shotCell)) {
      //     console.log(`Cell (${x}, ${y}) has already been attacked.`);
      //     // return; // Exit the function early if the cell was previously attacked
      // } else {
          roomUser?.shots?.add(shotCell);

          attackResponse(indexPlayer, x, y);
      // }
  } else if (user && user.isTurn && roomUser?.shots?.has(shotCell)) {
      turnResponse(user?.id || '');
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

