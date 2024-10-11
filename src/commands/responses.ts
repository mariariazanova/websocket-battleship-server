import { WebSocket } from 'ws';
import { User } from '../interfaces/user';
import {getCurrentUserName, getUserByIndex, getUserByName, users, winners} from '../database/users-database';
import { Command } from '../enums/command';
import { rooms } from '../database/rooms-database';
import { wsServer } from '../ws_server';
import {Ship, ShipsPerUser, ShipState} from '../interfaces/ship';
import {ships, shipsState} from "../database/ships-database";
import {shipsConfiguration} from "../constants/ships-configuration";
import {randomAttack} from "./game-commands";
import {game} from "../database/game-database";

export const registerResponse = (user: User, wsClient: WebSocket): void => {
    const dataMessage = {
        error: true,
        errorText: "",
        name: user.name,
        index: user.index,
        // id: user.id,
    };
    const existingUser = users.find(el => el.name === user.name)

    if (existingUser) {
        if (existingUser?.password === user.password) {
            dataMessage.error = false;
        } else {
            dataMessage.errorText = 'Wrong password';
        }
    } else {

            users.push(user);
            console.log('Registered user', user);
            console.log('All users', users);
            dataMessage.error = false;
    }

    wsClient.send(
        JSON.stringify({
            type: Command.REG,
            data: JSON.stringify(dataMessage),
            id: 0,
            // id: user.id,
        })
    );
    console.log('Response: ', {
        type: Command.REG,
        data: JSON.stringify(dataMessage),
        id: 0,
        // id: user.id,
    });
};

export const updateRoomResponse = (): void => {
    const currentUserName = getCurrentUserName();
    // const currentUser = getUserByName(currentUserName);
    console.log('update room', currentUserName);
    console.log(rooms, rooms[0]?.roomUsers, rooms[1]?.roomUsers, currentUserName);
    // const response = {
    //     type: Commands.UPDATE_ROOM,
    //     data: JSON.stringify(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== currentUserName)),
    //     id: 0,
    //     // id: rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].index !== userId)[0]?.roomId,
    // }

    let index = 0;
    // const currentUser = getUserByIndex(index);
    // console.log(currentUser);
    //
    const getResponse = (index: number) => ({
        type: Command.UPDATE_ROOM,
        data: JSON.stringify(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index)?.name)),
        // id: rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].index !== userId)[0]?.roomId,
        id: 0,
    });

    // wsServer.clients.forEach(item => {
    //     // console.log(item);
    //     item.send(JSON.stringify(response));
    // });

    // console.log('Response update room: ', response);

    // users.forEach(item => {
    //     console.log('HEY', users, index, getUserByIndex(index));
    //     console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index).name));
    //     item.send(JSON.stringify(getResponse(index)));
    //     console.log('Response update room: ', getResponse(index));
    //     index++;
    // });

    wsServer.clients.forEach(item => {
        console.log('HEY', users, index, getUserByIndex(index), rooms, rooms[0]?.roomUsers);
        console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index)?.name));
        getUserByIndex(index) && item.send(JSON.stringify(getResponse(index)));
        console.log('Response update room: ', getResponse(index));
        index++;
    });
};

export const updateWinnersResponse = (): void => {
    console.log('update winners')
    const response = {
        type: Command.UPDATE_WINNERS,
        data: JSON.stringify(winners.map((winner) => ({ name: winner.name, wins: winner.wins }))),
        id: 0,
    };

    let index = 0;

    wsServer.clients.forEach(item => {
        // console.log('HEY', users, index, getUserByIndex(index), rooms, rooms[0]?.roomUsers);
        // console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index)?.name));
        getUserByIndex(index) &&  item.send(JSON.stringify(response));
        console.log('Response update winners: ', response);
        index++;
    });
};

// export const startGameResponse = (ships: ShipsPerUser[]): void => {
export const startGameResponse = (): void => {
    console.log('ships', ships);

    let index = 0;

    const getResponse = (index: number) => ({
        type: Command.START_GAME,
        data: JSON.stringify({
            ships: ships.filter((ship) => ship.userId == getUserByIndex(index).id),
            currentPlayerIndex: getUserByIndex(index).id,
        }),
        // id: rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].index !== userId)[0]?.roomId,
        id: 0,
    });

    wsServer.clients.forEach(item => {
        // console.log('HEY', users, index, getUserByIndex(index));
        // console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index).name));
        item.send(JSON.stringify(getResponse(index)));
        console.log('Response start game: ', getResponse(index));
        index++;
    });
};

export const turnResponse = (userId?: number): void => {
    console.log('ships', ships);

    let index = 0;

    const getResponse = (index: number) => ({
        type: Command.TURN,
        data: JSON.stringify({
            currentPlayer: userId || getUserByIndex(index).id,
        }),
        id: 0,
    });

    wsServer.clients.forEach(item => {
        // console.log('HEY', users, index, getUserByIndex(index));
        // console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index).name));
        item.send(JSON.stringify(getResponse(index)));
        console.log('Response turn: ', index, getResponse(index));
        index++;
    });

    if (isSinglePlay() && userId === 111111) {
        console.log('single play');

        randomAttack(JSON.stringify({ gameId: game.gameId, indexPlayer: 111111 }));
    }
};

export const attackResponse = (userId: number, x: number, y: number): void => {
    // let index = 0;
    console.log('attackResponse');
    // const enemyShips = ships.find(shipsPerUser => shipsPerUser.userId !== userId).ships;
    // const shipStates = initializeShipStates(enemyShips);
    // console.log(ships)
    // console.log(enemyShips);
    // console.log(userId, x, y, processAttackResult(x, y, userId));

    // const getResponse = () => ({
    //     type: Commands.ATTACK,
    //     data: JSON.stringify({
    //         position: { x, y },
    //         currentPlayer: userId,//getUserByIndex(index).id,
    //         status: processAttackResult(x, y, userId),
    //     }),
    //     id: 0,
    // });
    const attackResult = processAttackResult(x, y, userId);
    console.log(attackResult);

    const response = {
        type: Command.ATTACK,
        data: JSON.stringify({
            position: { x, y },
            currentPlayer: userId,//getUserByIndex(index).id,
            status: attackResult,
        }),
        id: 0,
    };

    wsServer.clients.forEach(item => {
        // console.log('HEY', users, index, getUserByIndex(index));
        // console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index).name));
        item.send(JSON.stringify(response));
        console.log('Response attack: ', response);
        // index++;
    });

    const enemyUserId = users.find(user => user.id !== userId).id;

    console.log('nextUser not', userId, users, enemyUserId);

    if (isGameFinished(enemyUserId)) {
        console.log("Game is finished! All ships have been destroyed.");
        finishResponse(userId);
        updateWinnersResponse();
        return;
    }

    turnResponse(attackResult !== 'miss' ? userId : enemyUserId);

    // if (isSinglePlay()) {
    //     console.log('single play');
    //
    //     randomAttack(JSON.stringify({ gameId: game.gameId, indexPlayer: 111111 }));
    // }
};

export const finishResponse = (userId: number): void => {
    console.log('finish');

    const response = {
        type: Command.FINISH,
        data: JSON.stringify({
            winPlayer: userId,
        }),
        id: 0,
    };

    wsServer.clients.forEach(item => {
        item.send(JSON.stringify(response));
        console.log('Response turn: ', response);
    });

    const newWinner = winners.find((winner) => winner.id === userId);

    if (newWinner) {
        newWinner.wins += 1;
    } else {
        winners.push({
            id: userId,
            name: users.find(user => user.id === userId)?.name || "",
            wins: 1,
        });
    }

    rooms.length = 0;
    ships.length = 0;
    shipsState.length = 0;

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

export function getRandomShips(): Ship[] {
    const ships: Ship[] = [];
    const occupiedCells = new Set<string>(); // To track the cells occupied by ships
    const boardSize = 10;

    // Helper function to check if a ship can be placed at the given position
    const canPlaceShip = (x: number, y: number, length: number, direction: boolean): boolean => {
        for (let i = 0; i < length; i++) {
            const newX = x + (direction ? 0 : i); // Horizontal if direction is false
            const newY = y + (direction ? i : 0); // Vertical if direction is true

            // Check if the new position is within bounds and not occupied
            if (newX >= boardSize || newY >= boardSize || occupiedCells.has(`${newX},${newY}`)) {
                return false;
            }
        }
        return true;
    };

    // Helper function to add a ship to the occupied cells set
    const occupyCells = (x: number, y: number, length: number, direction: boolean) => {
        for (let i = 0; i < length; i++) {
            const newX = x + (direction ? 0 : i);
            const newY = y + (direction ? i : 0);
            occupiedCells.add(`${newX},${newY}`);
        }
    };

    // Generate ships for each model
    shipsConfiguration.forEach(({ type, length, count }) => {
        for (let i = 0; i < count; i++) {
            let placed = false;

            // Keep trying to place the ship until it fits
            while (!placed) {
                const direction = Math.random() < 0.5; // Randomly pick direction (horizontal or vertical)
                const x = Math.floor(Math.random() * boardSize);  // Random x position
                const y = Math.floor(Math.random() * boardSize);  // Random y position

                if (canPlaceShip(x, y, length, direction)) {
                    ships.push({
                        type,
                        length,
                        position: { x, y },
                        direction,
                    });
                    occupyCells(x, y, length, direction); // Mark the cells as occupied
                    placed = true;
                }
            }
        }
    });

    return ships;
}

function processAttackResult(x: number, y: number, userId: number): "miss" | "shot" | "killed" {
    console.log(x, y, userId);

    const enemyShips = ships.find(shipsPerUser => shipsPerUser.userId !== userId).ships;
    const coordinate = `${x},${y}`;
    console.log(enemyShips);

    for (const ship of enemyShips) {
        if (ship.remainingCells.has(coordinate)) {
            // The shot hits this ship
            ship.remainingCells.delete(coordinate);
            console.log(ship.remainingCells);

            if (ship.remainingCells.size === 0) {
                // The ship is killed
                return "killed";
            } else {
                // The ship is just shot
                return "shot";
            }
        }
    }

    // If no ship is hit, it's a miss
    return "miss";
}

function isGameFinished(enemyUserId: number): boolean {
    const enemyShips = ships.find(shipsPerUser => shipsPerUser.userId === enemyUserId).ships;

    return enemyShips.every(ship => ship.remainingCells.size === 0);
}

function isSinglePlay(): boolean {
    return !!users.find(user => user.name === 'bot');
}
