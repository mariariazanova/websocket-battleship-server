import { Command } from '../enums/command';
import { wsServer } from '../ws_server';
import {getCurrentUserName, getUserById, getUserByIndex, getUserByName} from '../database/users-database';
import {ships, shipsState} from '../database/ships-database';
import {attackResponse, initializeShipStates, updateRoomResponse, updateWinnersResponse} from "./responses";
import {registerUser} from "./user-commands";
import {generateUniqueId} from "../utils/generate-uuid";
import {game} from "../database/game-database";
import {Room} from "../interfaces/room";
import {rooms} from "../database/rooms-database";
import {wsClients} from "../database/ws-clients-database";
import {WebSocket} from "ws";

export const createGame = (data: any, userId: number): void => {
    console.log("Creating game...");
    console.log(data);
    console.log(userId);

    const { indexRoom } = JSON.parse(data);
    // const currentUserName = getCurrentUserName();
    // const currentUser = getUserByName(currentUserName);

    // const getResponse = (index: number) => ({
    //     type: Commands.CREATE_GAME,
    //     data: JSON.stringify(
    //         {
    //             idGame: 1,
    //             idPlayer: currentUser.id, //getUserByIndex(index).id,
    //         }),
    //     id: 0,
    // });
    const response = (index: number) =>  {
        // const currentUserName = getCurrentUserName();
        const currentUser = getUserByIndex(index);
            // getUserByName(currentUserName);
        // console.log(currentUser);
        const gameId = generateUniqueId();
        game.gameId = gameId;

        return {
            type: Command.CREATE_GAME,
            data: JSON.stringify(
                {
                    idGame: 1,
                    idPlayer: currentUser.id, //getUserByIndex(index).id,
                }),
            id: 0,
        };
    };

    const gameId = generateUniqueId();

    game.gameId = gameId;

    const response2 = (userId: number) =>  {
        // const currentUserName = getCurrentUserName();
        // const currentUser = getUserByIndex(index);
        // getUserByName(currentUserName);
        // console.log(currentUser);

        return {
            type: Command.CREATE_GAME,
            data: JSON.stringify(
                {
                    idGame: gameId,
                    idPlayer: userId, //getUserByIndex(index).id,
                }),
            id: 0,
        };
    };


    // let index = 0;

    rooms.find(room => room.roomId === indexRoom).roomUsers.forEach(user => {
        // const currentUserName = getUserById(client.id).name;
        const userName = user.name;
        const userId = getUserByName(userName).id;
        const wsClient = wsClients.find(client => client.name === user.name);
        const wsSocket = wsClient.ws;

        wsSocket.send(JSON.stringify(response2(userId)));
    });

    // rooms.filter(room => room.roomId !== indexRoom);

    // wsServer.clients.forEach(client => {
    //     console.log(index);
    //     console.log(rooms.find(room => room.roomId === indexRoom).roomUsers);
    //
    //     rooms.forEach(room => {
    //         const isUserPlaying = room.roomUsers.length === 2 && room.roomUsers.some(user => user.index === index);
    //
    //         isUserPlaying && client.send(JSON.stringify(response(index)));
    //         // console.log('Response create_game: ', response(index));
    //         index++;
    //     });
    //     // client.send(JSON.stringify(response(index)));
    //     // console.log('Response create_game: ', response(index));
    //     // index++;
    // });
};

export const addShips = (data: any): void => {
  // console.log(data);
  const { gameId, ships: createdShips, indexPlayer } = JSON.parse(data);
  console.log(gameId);
  console.log(createdShips);
  console.log(indexPlayer);

  ships.push({
      userId: indexPlayer,
      ships: initializeShipStates(createdShips),
  });
  console.log('initialized ships', ships);
};

export const attack = (data: any): void => {
    console.log('attack');
    const { gameId, indexPlayer, x, y } = JSON.parse(data);

    console.log(gameId, indexPlayer, x, y);

    attackResponse(indexPlayer, x, y);
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

