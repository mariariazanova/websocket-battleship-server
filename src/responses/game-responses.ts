import { randomUUID } from 'crypto';
import { Command } from '../enums/command';
import { rooms } from '../database/rooms-database';
import {
  getRoomByUserId,
  getRoomUserByUserId,
  getRoomUsers,
  getRoomUsersByUserId,
} from '../functions/get-room-info';
import { botUser, loggedUsers } from '../database/users-database';
import { getUserById, getUserByName } from '../functions/get-user-info';
import { sendResponse } from '../utils/send-response';
import { ShipState } from '../interfaces/ship';
import { isUserPlayingInGame } from '../functions/is-user-playing';
import { randomAttack } from '../commands/game-commands';
import { isSinglePlay } from '../functions/is-single-play';
import { updateWinnersResponse } from './user-responses';
import { getAttackResult } from '../functions/get-attack-result';
import { isGameFinished } from '../functions/is-game-finished';
import { AttackResultState } from '../enums/attack-result-state';
import { Room } from '../interfaces/room';

export const createGameResponse = (data: any, userId: string): void => {
  const { indexRoom } = JSON.parse(data);
  const gameId = randomUUID();

  const getGameInfo = (userId: string) => ({ idGame: gameId, idPlayer: userId });
  const roomToPlay = rooms.find(room => room.roomId === indexRoom);
  const roomUsers = getRoomUsersByUserId(userId);

  if (roomToPlay) {
    roomToPlay.gameId = gameId;

    roomUsers?.length && roomUsers.forEach((roomUser) => {
      const user = getUserByName(roomUser?.name || '');

      if (user) {
        user.isPlaying = true;
      }

      sendResponse(roomUser.userId, Command.CREATE_GAME, getGameInfo(roomUser.userId));
    });
  }
};

export const startGameResponse = (data: any): void => {
  const { gameId } = JSON.parse(data);
  const room = rooms.find(room => room.gameId === gameId);
  const roomUsers = getRoomUsers(<Room>room);

  const areAllShipsSetForBothUsers = roomUsers.every(
    (user) => Array.isArray(user.ships) && !!user.ships.length
  );

  if (areAllShipsSetForBothUsers) {
    const getUserShips = (userId: string): ShipState[] | undefined => roomUsers.find((user) => user.userId == userId)?.ships;

    roomUsers?.forEach((roomUser) => {
      const isUserPlaying = isUserPlayingInGame(roomUser.userId);

      isUserPlaying && sendResponse(roomUser.userId, Command.START_GAME, getUserShips(roomUser.userId));
      isUserPlaying && turnResponse(roomUsers[0].userId);
    });
  }
};

export const turnResponse = (userId: string): void => {
  const roomUsers = getRoomUsersByUserId(userId);

  const getTurnData = (): Record<string, number | string> | undefined=> {
    const user = getUserById(userId);

    if (user) {
      const enemyRoomUser = getRoomUserByUserId(userId, false);

      user.isTurn = true;

      if (enemyRoomUser) {
        const enemy = getUserByName(<string>enemyRoomUser.name);

        if (enemy) {
          enemy.isTurn = false;
        }

        return { currentPlayer: userId || user.id };
      }
    }
  };

  roomUsers?.forEach((roomUser) => {
    const isUserPlaying = isUserPlayingInGame(roomUser.userId);

    isUserPlaying && sendResponse(roomUser.userId, Command.TURN, getTurnData());
  });

  if (isSinglePlay() && userId === botUser.id) {
    const room = getRoomByUserId(botUser.id);

    setTimeout(() => {
      randomAttack(JSON.stringify({ gameId: room?.gameId, indexPlayer: botUser.id }));
    }, 1500);
  }
};

export const attackResponse = (userId: string, x: number, y: number): void => {
  const { attackResultStatus, surroundingCells } = getAttackResult(x, y, userId);
  const attackData = {
    position: { x, y },
    currentPlayer: userId,
    status: attackResultStatus,
  };
  const roomUsers = getRoomUsersByUserId(userId);

  roomUsers?.forEach((roomUser) => {
    const isUserPlaying = isUserPlayingInGame(roomUser.userId);

    isUserPlaying && sendResponse(roomUser.userId, Command.ATTACK, attackData);

    if (attackResultStatus === AttackResultState.Killed) {
      surroundingCells?.forEach(cell => {
        const [x, y] = cell.split(',').map(Number);
        const clearCellsData = {
          position: { x, y },
          currentPlayer: userId,
          status: AttackResultState.Miss,
        };

        isUserPlaying && sendResponse(roomUser.userId, Command.ATTACK, clearCellsData);

        if (roomUser.userId === userId) {
          roomUser?.shots?.add(`${x},${y}`);
        }
      });
    }
  });

  const enemyRoomUser = getRoomUserByUserId(userId, false);
  const enemyUserId = enemyRoomUser?.userId;

  if (enemyUserId && isGameFinished(enemyUserId)) {
    finishResponse(userId);
    updateWinnersResponse();
    return;
  }

  turnResponse(attackResultStatus !== AttackResultState.Miss ? userId : <string>enemyUserId);
};

export const finishResponse = (userId: string): void => {
  const finishData = { winPlayer: userId };
  const roomUsers = getRoomUsersByUserId(userId);

  roomUsers?.forEach((roomUser) => {
    const isUserPlaying = isUserPlayingInGame(roomUser.userId);
    const user = getUserByName(roomUser?.name || '');

    if (user) {
      user.isPlaying = false;
      user.isTurn = false;
    }

    isUserPlaying && sendResponse(roomUser.userId, Command.FINISH, finishData);
  });

  const newWinner = loggedUsers.find((user) => user.name === getUserById(userId)?.name);

  if (newWinner) {
    newWinner.wins += 1;
  }

  const index = rooms.findIndex(room => room.roomId === room.roomId);

  if (index !== -1) {
    rooms.splice(index, 1)
  }
};
