import { WebSocket } from 'ws';
import { User } from '../interfaces/user';
import {
    getUserById,
    getUserByIndex,
    getUserByName, loggedUsers,
    users,
    winners
} from '../database/users-database';
import { Command } from '../enums/command';
import { rooms } from '../database/rooms-database';
import {Ship, ShipsPerUser, ShipState} from '../interfaces/ship';
import { shipsConfiguration } from '../constants/ships-configuration';
import { randomAttack } from './game-commands';
import { wsClients } from '../database/ws-clients-database';
import { isUserPlayingInGame } from '../utils/is-user-playing';
import { Room } from '../interfaces/room';
import { sendResponse } from '../utils/send-response';
import {turnResponse} from "../responses/game-responses";
import {updateWinnersResponse} from "../responses/user-responses";
import {AttackResult} from "../enums/attack-result";











export const finishResponse = (userId: string): void => {
    console.log('finish');

    const response = {
        type: Command.FINISH,
        data: JSON.stringify({
            winPlayer: userId,
        }),
        id: 0,
    };

    wsClients.forEach(client => {
        // wsServer.clients.forEach(item => {
        // console.log('HEY', users, index, getUserByIndex(index));
        // console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index).name));
        // item.send(JSON.stringify(getResponse(index)));
        const isUserPlaying = isUserPlayingInGame(client.id);
    // wsServer.clients.forEach(item => {
        // rooms.find(item => item.roomId === indexRoom);

        isUserPlaying && client.ws.send(JSON.stringify(response));
        console.log('Response turn: ', response);
    });

    const newWinner = loggedUsers.find((user) => user.name === getUserById(userId)?.name);

    if (newWinner) {
        newWinner.wins += 1;
    }

    // if (newWinner?.wins === 0) {
    //     newWinner.wins += 1;
    // } else {
    //     newWinner.wins = 1;
    //     // winners.push({
    //     //     id: userId,
    //     //     name: users.find(user => user.id === userId)?.name || "",
    //     //     wins: 1,
    //     // });
    // }

    const room = rooms.find(room => room.roomUsers.some(roomUser => roomUser.name === getUserById(userId)?.name));

    room?.roomUsers.forEach(roomUser => {
        const foundUser = getUserByName(roomUser?.name || '');

        if (foundUser) {
            foundUser.isPlaying = false;
            foundUser.isTurn = false;
        }
    })

    //delete room
    const index = rooms.findIndex(room => room.roomId === room.roomId);

    if (index !== -1) {
        rooms.splice(index, 1)
    }

    //delete ships
    // const shipIndex = ships.findIndex(shipConfig => shipConfig.userId === userId);
    //
    // if (shipIndex !== -1) {
    //     ships.splice(index, 1)
    // }

    // shipsState.length = 0;

};

export function initializeShipStates(ships: Ship[]): ShipState[] {
  return ships.map(ship => {
    const remainingCells = new Set<string>();

    for (let i = 0; i < ship.length; i++) {
      const x = ship.position.x + (ship.direction ? 0 : i);
      const y = ship.position.y + (ship.direction ? i : 0);

      remainingCells.add(`${x},${y}`);
    }

    return { ...ship, remainingCells };
  });
}

export function getRandomShips(): ShipState[] {
    const ships: ShipState[] = [];
    const shipModels = shipsConfiguration;

    // Sort ships by size in descending order
    shipModels.sort((a, b) => b.length - a.length);

    // Initialize the field
    const field: boolean[][] = Array.from({ length: 10 }, () => Array(10).fill(false)); // false indicates the cell is unoccupied

    // Function to check if the ship can be placed
    function canPlaceShip(x: number, y: number, length: number, direction: boolean): boolean {
        for (let i = 0; i < length; i++) {
            const shipX = x + (direction ? 0 : i);
            const shipY = y + (direction ? i : 0);

            // Check for out-of-bounds and existing ships
            if (shipX >= 10 || shipY >= 10 || field[shipX][shipY]) {
                return false;
            }
        }

        // Check for surrounding cells to ensure at least one empty cell between ships
        const checkOffsets = [-1, 0, 1]; // For surrounding cells
        for (let i = 0; i < length; i++) {
            const shipX = x + (direction ? 0 : i);
            const shipY = y + (direction ? i : 0);

            for (const offsetX of checkOffsets) {
                for (const offsetY of checkOffsets) {
                    const checkX = shipX + offsetX;
                    const checkY = shipY + offsetY;

                    // Ensure we're not checking the ship's own cells
                    if (offsetX === 0 && offsetY === 0) continue;

                    if (checkX >= 0 && checkY >= 0 && checkX < 10 && checkY < 10) {
                        if (field[checkX][checkY]) {
                            return false; // Found an occupied surrounding cell
                        }
                    }
                }
            }
        }

        return true; // Valid position
    }

    // Place ships
    shipModels.forEach(shipModel => {
        for (let k = 0; k < shipModel.count; k++) {
            let hasPosition = false;
            // let attempts = 0;
            // const maxAttempts = 100; // Limit attempts to prevent infinite loops
            let randomCell: { x: number; y: number };
            let randomDirection: boolean;

            // Find a valid position for the ship
            // while (!hasPosition && attempts < maxAttempts) {
            //     attempts++;
                randomCell = {
                    x: Math.floor(Math.random() * 10), // Random x position
                    y: Math.floor(Math.random() * 10), // Random y position
                };
                randomDirection = Math.random() < 0.5; // Randomly choose direction

                // Check if the ship can be placed at the random position
                if (canPlaceShip(randomCell.x, randomCell.y, shipModel.length, randomDirection)) {
                    hasPosition = true;
                }
            // }

            // // If no valid position is found after max attempts, skip to the next ship
            // if (!hasPosition) {
            //     console.warn(`Unable to place ${shipModel.type} after ${maxAttempts} attempts. Moving on.`);
            //     continue; // Proceed to next ship model
            // }

            // Place the ship
            const remainingCells = new Set<string>(); // To track remaining cells of the ship
            for (let i = 0; i < shipModel.length; i++) {
                const shipX = randomCell.x + (randomDirection ? 0 : i);
                const shipY = randomCell.y + (randomDirection ? i : 0);
                field[shipX][shipY] = true; // Mark cell as occupied
                remainingCells.add(`${shipX},${shipY}`); // Add the cell to the remaining cells
            }

            const ship: ShipState = {
                length: shipModel.length,
                direction: randomDirection,
                position: randomCell,
                type: shipModel.type,
                remainingCells: remainingCells,
            };

            ships.push(ship);
        }
    });

    return ships;
}

// function processAttackResult(x: number, y: number, userId: string): "miss" | "shot" | "killed" {
//     console.log(x, y, userId);
//
//     const enemyShips = ships.find(shipsPerUser => shipsPerUser.userId !== userId)?.ships ?? [];
//     const coordinate = `${x},${y}`;
//     console.log(enemyShips);
//
//     for (const ship of enemyShips) {
//         if (ship.remainingCells.has(coordinate)) {
//             // The shot hits this ship
//             ship.remainingCells.delete(coordinate);
//             console.log(ship.remainingCells);
//
//             if (ship.remainingCells.size === 0) {
//                 // The ship is killed
//                 return AttackResult.Killed;
//             } else {
//                 // The ship is just shot
//                 return AttackResult.Shot;
//             }
//         }
//     }
//
//     // If no ship is hit, it's a miss
//     return AttackResult.Miss;
// }



function isSinglePlay(): boolean {
    return !!users.find(user => user.name === 'bot');
}
