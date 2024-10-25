import { generateUniqueId } from '../utils/generate-uuid';
import { game, games } from '../database/game-database';
import { Command } from '../enums/command';
import { rooms } from '../database/rooms-database';
import { wsClients } from '../database/ws-clients-database';
import {getUserById, getUserByIndex, getUserByName, users} from '../database/users-database';
import { sendResponse } from '../utils/send-response';
import { ships } from '../database/ships-database';
import { ShipsPerUser } from '../interfaces/ship';
import { isUserPlayingInGame } from '../utils/is-user-playing';
import { randomAttack } from '../commands/game-commands';
import { isSinglePlay } from '../utils/is-single-play';
import { updateWinnersResponse } from './user-responses';
import { finishResponse } from '../commands/responses';
import { getAttackResult } from '../utils/get-attack-result';
import { isGameFinished } from '../utils/is-game-finished';
import {AttackResult} from "../enums/attack-result";

export const createGameResponse = (data: any, userId: number): void => {
  // console.log('createGameResponse', userId);
  const { indexRoom } = JSON.parse(data);
  const gameId = generateUniqueId();

  games.push({ gameId });

  const getGameInfo = (userId: number | string) => ({ idGame: gameId, idPlayer: userId });
  const roomToPlay = rooms.find(room => room.roomId === indexRoom);

  if (roomToPlay) {
    wsClients.forEach(client => {
      const currentUser = getUserById(client.id);
      // console.log(currentUser, client.id);

      if (currentUser) {
        const isUserPlayingInRoom = roomToPlay.roomUsers.find(user => user.name === currentUser.name);

        currentUser.isPlaying = true;
        isUserPlayingInRoom && sendResponse(client.id, Command.CREATE_GAME, getGameInfo(client.id));
        // isUserPlayingInRoom && sendResponse(client.ws, Command.CREATE_GAME, getGameInfo(client.id));
      }
    });
  }
};

export const startGameResponse = (data: any): void => {
  // console.log('startGameResponse', data);
  const { gameId } = JSON.parse(data);
  const areAllShipsSetForBothUsers = ships.filter(shipConfig => shipConfig.gameId === gameId).length === 2;

  if (areAllShipsSetForBothUsers) {
    const getUserShips = (userId: number | string): ShipsPerUser[] => ships.filter((ship) => ship.userId == userId);

    wsClients.forEach(client => {
      const currentUser = getUserById(client.id);

      if (currentUser) {
        const isUserPlaying = isUserPlayingInGame(currentUser.id);

        isUserPlaying && sendResponse(client.id, Command.START_GAME, getUserShips(client.id));
        // isUserPlaying && sendResponse(client.ws, Command.START_GAME, getUserShips(client.id));
        isUserPlaying && turnResponse(ships.filter(shipConfig => shipConfig.gameId === gameId)[0].userId);
      }
    });
  }
};

export const turnResponse = (userId: number): void => {
  console.log('userId fot turn', userId);
  // let index = 0;

  const getTurnData = (): Record<string, number | string> | undefined=> {
  // const turnData = {
    const user = getUserById(userId);
    // let turnData: Record<string, number> | undefined;

    if (user) {
      // console.log('user turn', user);
      user.isTurn = true;
      const room = rooms.find(room => room.roomUsers.some(roomUser => roomUser.name === user.name));
      // const enemy = room?.roomUsers
      if (room) {
        const enemyInRoom = room.roomUsers.find(roomUser => roomUser.name !== user.name);

        if (enemyInRoom) {
          const enemy = getUserByName(enemyInRoom.name);

          if (enemy) {
            // console.log('enemy', enemy);
            enemy.isTurn = false;
          }
        }
      }
      // console.log(user, { currentPlayer: userId || user.id });
      return { currentPlayer: userId || user.id };
      // turnData = { currentPlayer: userId || user.id };
    }
  };

  wsClients.forEach(client => {
    const isUserPlaying = isUserPlayingInGame(client.id);
    // console.log(client.id, isUserPlaying);
    // console.log(users);

    // isUserPlaying && sendResponse(client.ws, Command.TURN, getTurnData());
    isUserPlaying && sendResponse(client.id, Command.TURN, getTurnData());
    // index++;
  });

  if (isSinglePlay() && userId === 111111) {
    console.log('single play');

    setTimeout(() => {
      // not game, but use games
      randomAttack(JSON.stringify({ gameId: game.gameId, indexPlayer: 111111 }));
    }, 1500);

    // randomAttack(JSON.stringify({ gameId: game.gameId, indexPlayer: 111111 }));
  }
};

export const attackResponse = (userId: number, x: number, y: number): void => {
  // let index = 0;
  const attackResult = getAttackResult(x, y, userId);
  // console.log(attackResult);
  const attackData = {
    position: { x, y },
    currentPlayer: userId,
    status: attackResult,
  };

  // const response = {
  //   type: Command.ATTACK,
  //   data: JSON.stringify({
  //     position: { x, y },
  //     currentPlayer: userId,//getUserByIndex(index).id,
  //     status: attackResult,
  //   }),
  //   id: 0,
  // };

  wsClients.forEach(client => {
    const isUserPlaying = isUserPlayingInGame(client.id);

    isUserPlaying && sendResponse(client.id, Command.ATTACK, attackData);
    // isUserPlaying && sendResponse(client.ws, Command.ATTACK, attackData);
  });

  const enemyUserId = users.find(user => user.id !== userId)?.id;

  // console.log('nextUser not', userId, users, enemyUserId);

  if (enemyUserId && isGameFinished(enemyUserId)) {
    console.log("Game is finished! All ships have been destroyed.");
    finishResponse(userId);
    updateWinnersResponse();
    return;
  }

  turnResponse(attackResult !== AttackResult.Miss ? <number>userId : <number>enemyUserId);

  // if (isSinglePlay()) {
  //     console.log('single play');
  //
  //     randomAttack(JSON.stringify({ gameId: game.gameId, indexPlayer: 111111 }));
  // }
};
