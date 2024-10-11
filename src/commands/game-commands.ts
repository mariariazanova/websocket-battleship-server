import { Command } from '../enums/command';
import { wsServer } from '../ws_server';
import { getCurrentUserName, getUserByIndex, getUserByName } from '../database/users-database';
import {ships, shipsState} from '../database/ships-database';
import {attackResponse, initializeShipStates, updateRoomResponse, updateWinnersResponse} from "./responses";
import {registerUser} from "./user-commands";
import {generateUniqueId} from "../utils/generate-uuid";
import {game} from "../database/game-database";

export const createGame = (data: any, userId: number): void => {
    console.log("Creating game...");
    console.log(data);
    console.log(userId);
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


    let index = 0;

    wsServer.clients.forEach(client => {
        console.log(index);
        client.send(JSON.stringify(response(index)));
        console.log('Response create_game: ', response(index));
        index++;
    });
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

export const randomAttack = (data: any): void => {
    console.log('randomAttack');
    const { gameId, indexPlayer } = JSON.parse(data);
    attack(
        JSON.stringify({
            gameId,
            x: Math.floor(Math.random() * 10),
            y: Math.floor(Math.random() * 10),
            indexPlayer,
        })
    );
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

