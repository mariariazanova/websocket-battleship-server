import { WebSocket } from 'ws';
import {
  getUserById,
  loggedUsers,
  users,
  winners
} from '../database/users-database';
import { wsClients } from '../database/ws-clients-database';
import { sendResponse, sendResponse2} from '../utils/send-response';
import { Command } from '../enums/command';
import { LoggedUser, User} from '../interfaces/user';
import { isUserPlayingInGame } from '../utils/is-user-playing';
import { WsClient } from '../interfaces/ws-client';

export const registerResponse = (loggedUser: LoggedUser, wsClient: WsClient): void => {
  const wsClientIndex = wsClients.length;
  const dataMessage = {
    error: true,
    errorText: '',
    name: loggedUser.name,
    index: wsClientIndex,
  };
  const createdWsClient = { ...wsClient, index: wsClient };
  const existingWsClient = wsClients.find(client => client.name === wsClient.name);
  const existingUser = loggedUsers.find(existingUser => existingUser.name === loggedUser.name);

  if (existingUser) {
    // const isUserAlreadyRegistered = existingUser.isRegistered;

    if (existingWsClient) {
      dataMessage.errorText = 'Already registered';
    } else {
      if (existingUser?.password === loggedUser.password) {
        dataMessage.error = false;
        // updateUserRegisteredState(loggedUser.name);
        wsClients.push(wsClient);
        // users.push(createdUser);
        // console.log('u', users);
      } else {
        dataMessage.errorText = 'Wrong password';
      }
    }
  } else {
    // const createdUser = { ...sessionUser, index:  userIndex };
    // const createdLoggedUser = { ...loggedUser, isRegistered: true };

    loggedUsers.push(loggedUser);
    wsClients.push(wsClient);
    // wsClients.push({
    //   id: sessionUser.id,
    //   name: sessionUser.name,
    //   ws: wsClient,
    // });
    dataMessage.error = false;
  }
  // sendResponse(user.id, Command.REG, dataMessage);
  sendResponse2(wsClient, Command.REG, dataMessage);
};

export const updateWinnersResponse = (): void => {
  console.log(loggedUsers);
  const winnersAndWins = loggedUsers.map((user) => ({ name: user.name, wins: user.wins }));

  wsClients.forEach(client => {
    const currentUser = getUserById(client.id);
    console.log(client.id, currentUser?.name, currentUser?.isPlaying, currentUser?.isTurn);

    if (currentUser) {
      // const isUserPlaying = isUserPlayingInGame(currentUser.id);
      const isUserPlaying = isUserPlayingInGame(client.id);

      !isUserPlaying && sendResponse(client.id, Command.UPDATE_WINNERS, winnersAndWins);
      // !isUserPlaying && sendResponse(client.ws, Command.UPDATE_WINNERS, winnersAndWins);
    }
  });
};
