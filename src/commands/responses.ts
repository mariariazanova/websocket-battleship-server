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
            const remainingCells = new Set<string>();
            // const occupiedCells = new Set<string>();
            for (let i = 0; i < shipModel.length; i++) {
                const shipX = randomCell.x + (randomDirection ? 0 : i);
                const shipY = randomCell.y + (randomDirection ? i : 0);
                field[shipX][shipY] = true; // Mark cell as occupied
                remainingCells.add(`${shipX},${shipY}`);
                // occupiedCells.add(`${shipX},${shipY}`);
            }

            const ship: ShipState = {
                length: shipModel.length,
                direction: randomDirection,
                position: randomCell,
                type: shipModel.type,
                remainingCells: remainingCells,
                // occupiedCells:  occupiedCells,
            };

            ships.push(ship);
        }
    });

    return ships;
}
