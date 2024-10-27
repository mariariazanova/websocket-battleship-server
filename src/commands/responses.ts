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



export function initializeShipStates(ships: Ship[]): ShipState[] {
  return ships.map(ship => {
    const remainingCells = new Set<string>();
    const occupiedCells = new Set<string>();

    for (let i = 0; i < ship.length; i++) {
      const x = ship.position.x + (ship.direction ? 0 : i);
      const y = ship.position.y + (ship.direction ? i : 0);

      remainingCells.add(`${x},${y}`);
      occupiedCells.add(`${x},${y}`)
    }

    return { ...ship, remainingCells, occupiedCells };
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
        const checkOffsets = [-1, 0, 1];
        for (let i = 0; i < length; i++) {
            const shipX = x + (direction ? 0 : i);
            const shipY = y + (direction ? i : 0);

            for (const offsetX of checkOffsets) {
                for (const offsetY of checkOffsets) {
                    const checkX = shipX + offsetX;
                    const checkY = shipY + offsetY;

                    if (offsetX === 0 && offsetY === 0) continue;

                    if (checkX >= 0 && checkY >= 0 && checkX < 10 && checkY < 10) {
                        if (field[checkX][checkY]) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    // Helper to shuffle an array
    function shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Generate all possible positions
    const allPositions = [];
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            allPositions.push({ x, y });
        }
    }

    // Shuffle the list to introduce randomness
    const shuffledPositions = shuffleArray(allPositions);

    // Place ships
    shipModels.forEach(shipModel => {
        for (let k = 0; k < shipModel.count; k++) {
            let hasPosition = false;

            // Iterate over shuffled positions to find a suitable spot
            for (const pos of shuffledPositions) {
                const randomDirection = Math.random() < 0.5;

                if (canPlaceShip(pos.x, pos.y, shipModel.length, randomDirection)) {
                    hasPosition = true;

                    // Place the ship on the board
                    const remainingCells = new Set<string>();
                    for (let i = 0; i < shipModel.length; i++) {
                        const shipX = pos.x + (randomDirection ? 0 : i);
                        const shipY = pos.y + (randomDirection ? i : 0);
                        field[shipX][shipY] = true;
                        remainingCells.add(`${shipX},${shipY}`);
                    }

                    const ship: ShipState = {
                        length: shipModel.length,
                        direction: randomDirection,
                        position: pos,
                        type: shipModel.type,
                        remainingCells: remainingCells,
                    };

                    ships.push(ship);
                    break;
                }
            }

            if (!hasPosition) {
                console.warn(`Unable to place ${shipModel.type}. Moving on.`);
                continue;
            }
        }
    });

    console.log("BOT SHIPS", ships);
    return ships;
}

// export function getRandomShips(): ShipState[] {
//     const ships: ShipState[] = [];
//     const shipModels = shipsConfiguration;
//     const maxAttempts = 100;
//
//     // Sort ships by size in descending order
//     shipModels.sort((a, b) => b.length - a.length);
//
//     // Initialize the field
//     const field: boolean[][] = Array.from({ length: 10 }, () => Array(10).fill(false)); // false indicates the cell is unoccupied
//
//     // Function to check if the ship can be placed
//     function canPlaceShip(x: number, y: number, length: number, direction: boolean): boolean {
//         for (let i = 0; i < length; i++) {
//             const shipX = x + (direction ? 0 : i);
//             const shipY = y + (direction ? i : 0);
//
//             // Check for out-of-bounds and existing ships
//             if (shipX >= 10 || shipY >= 10 || field[shipX][shipY]) {
//                 return false;
//             }
//         }
//
//         // Check for surrounding cells to ensure at least one empty cell between ships
//         const checkOffsets = [-1, 0, 1]; // For surrounding cells
//         for (let i = 0; i < length; i++) {
//             const shipX = x + (direction ? 0 : i);
//             const shipY = y + (direction ? i : 0);
//
//             for (const offsetX of checkOffsets) {
//                 for (const offsetY of checkOffsets) {
//                     const checkX = shipX + offsetX;
//                     const checkY = shipY + offsetY;
//
//                     // Ensure we're not checking the ship's own cells
//                     if (offsetX === 0 && offsetY === 0) continue;
//
//                     if (checkX >= 0 && checkY >= 0 && checkX < 10 && checkY < 10) {
//                         if (field[checkX][checkY]) {
//                             return false; // Found an occupied surrounding cell
//                         }
//                     }
//                 }
//             }
//         }
//
//         return true; // Valid position
//     }
//
//     // Place ships
//     console.log('SHIPMODELS', shipModels);
//     shipModels.forEach(shipModel => {
//         for (let k = 0; k < shipModel.count; k++) {
//             let hasPosition = false;
//             // let attempts = 0;
//             // const maxAttempts = 100; // Limit attempts to prevent infinite loops
//             let randomCell: { x: number; y: number };
//             let randomDirection: boolean;
//
//             // Find a valid position for the ship
//             // while (!hasPosition && attempts < maxAttempts) {
//             //     attempts++;
//                 randomCell = {
//                     x: Math.floor(Math.random() * 10), // Random x position
//                     y: Math.floor(Math.random() * 10), // Random y position
//                 };
//                 randomDirection = Math.random() < 0.5; // Randomly choose direction
//
//                 // Check if the ship can be placed at the random position
//                 if (canPlaceShip(randomCell.x, randomCell.y, shipModel.length, randomDirection)) {
//                     hasPosition = true;
//                 }
//             // }
//
//             // // If no valid position is found after max attempts, skip to the next ship
//             if (!hasPosition) {
//                 console.warn(`Unable to place`);// ${shipModel.type} after ${maxAttempts} attempts. Moving on.`);
//                 continue; // Proceed to next ship model
//             }
//
//             // Place the ship
//             const remainingCells = new Set<string>();
//             // const occupiedCells = new Set<string>();
//             for (let i = 0; i < shipModel.length; i++) {
//                 const shipX = randomCell.x + (randomDirection ? 0 : i);
//                 const shipY = randomCell.y + (randomDirection ? i : 0);
//                 field[shipX][shipY] = true; // Mark cell as occupied
//                 remainingCells.add(`${shipX},${shipY}`);
//                 // occupiedCells.add(`${shipX},${shipY}`);
//             }
//
//             const ship: ShipState = {
//                 length: shipModel.length,
//                 direction: randomDirection,
//                 position: randomCell,
//                 type: shipModel.type,
//                 remainingCells: remainingCells,
//                 // occupiedCells:  occupiedCells,
//             };
//
//             ships.push(ship);
//         }
//     });
//
//     console.log("BOT SHIPS", ships);
//     return ships;
// }
