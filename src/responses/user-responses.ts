import { loggedUsers } from '../database/users-database';
import { wsClients } from '../database/ws-clients-database';
import { sendResponse, sendResponseToClient } from '../utils/send-response';
import { Command } from '../enums/command';
import { LoggedUser } from '../interfaces/user';
import { isUserPlayingInGame } from '../functions/is-user-playing';
import { WsClient } from '../interfaces/ws-client';
import { getUserById } from '../functions/get-user-info';

export const registerResponse = (loggedUser: LoggedUser, wsClient: WsClient): void => {
  const wsClientIndex = wsClients.length;
  const dataMessage = {
    error: true,
    errorText: '',
    name: loggedUser.name,
    index: wsClientIndex,
  };
  const existingWsClient = wsClients.find(client => client.name === wsClient.name);
  const existingUser = loggedUsers.find(existingUser => existingUser.name === loggedUser.name);

  if (existingUser) {
    if (existingWsClient) {
      dataMessage.errorText = 'Already registered';
    } else {
      if (existingUser?.password === loggedUser.password) {
        dataMessage.error = false;

        wsClients.push(wsClient);
      } else {
        dataMessage.errorText = 'Wrong password';
      }
    }
  } else {
    loggedUsers.push(loggedUser);
    wsClients.push(wsClient);

    dataMessage.error = false;
  }

  sendResponseToClient(wsClient, Command.REG, dataMessage);
};

export const updateWinnersResponse = (): void => {
  const winnersAndWins = loggedUsers.map((user) => ({ name: user.name, wins: user.wins }));

  wsClients.forEach(client => {
    const currentUser = getUserById(client.id);

    if (currentUser) {
      const isUserPlaying = isUserPlayingInGame(client.id);

      !isUserPlaying && sendResponse(client.id, Command.UPDATE_WINNERS, winnersAndWins);
    }
  });
};
