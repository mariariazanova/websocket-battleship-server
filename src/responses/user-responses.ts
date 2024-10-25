import { WebSocket } from 'ws';
import {getUserById, users, winners} from '../database/users-database';
import { wsClients } from '../database/ws-clients-database';
import { sendResponse } from '../utils/send-response';
import { Command } from '../enums/command';
import { User } from '../interfaces/user';
import {isUserPlayingInGame} from "../utils/is-user-playing";

export const registerResponse = (user: User, wsClient: WebSocket): void => {
  const userIndex = users.length;
  const dataMessage = {
    error: true,
    errorText: '',
    name: user.name,
    index: userIndex,
  };
  console.log(user);
  console.log(users);
  const existingUser = users.find(existingUser => existingUser.name === user.name);

  if (existingUser) {
    const isUserAlreadyRegistered = existingUser?.isRegistered;

    if (isUserAlreadyRegistered) {
      dataMessage.errorText = 'User already registered';
    } else {
      if (existingUser?.password === user.password) {
        dataMessage.error = false;
      } else {
        dataMessage.errorText = 'Wrong password';
      }
    }
  } else {
    const createdUser = { ...user, index:  userIndex, isPlaying: false, isRegistered: true };

    users.push(createdUser);
    wsClients.push({
      id: user.id,
      name: user.name,
      ws: wsClient,
    });
    dataMessage.error = false;
  }

  sendResponse(user.id, Command.REG, dataMessage);
  // sendResponse(wsClient, Command.REG, dataMessage);
};

export const updateWinnersResponse = (): void => {
  const winnersAndWins = winners.map((winner) => ({ name: winner.name, wins: winner.wins }));

  wsClients.forEach(client => {
    const currentUser = getUserById(client.id);

    if (currentUser) {
      // const isUserPlaying = isUserPlayingInGame(currentUser.id);
      const isUserPlaying = isUserPlayingInGame(client.id);

      !isUserPlaying && sendResponse(client.id, Command.UPDATE_WINNERS, winnersAndWins);
      // !isUserPlaying && sendResponse(client.ws, Command.UPDATE_WINNERS, winnersAndWins);
    }
  });
};