import { Command } from '../enums/command';
import { WsClient } from '../interfaces/ws-client';
import { getUserById } from '../functions/get-user-info';
import { getWebSocketByUserId } from '../functions/get-ws-client-info';

export const sendResponse = (
  userId: string,
  command: Command,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): void => {
  const response = {
    type: command,
    data: JSON.stringify(data),
    id: 0,
  };

  const userName = getUserById(userId)?.name;
  const webSocket = getWebSocketByUserId(userId);

  if (webSocket) {
    webSocket.send(JSON.stringify(response));
    // eslint-disable-next-line no-console
    console.log(
      `Send response ${command} to user with id ${userId} and name "${userName}":`,
      data,
    );
  }
};

export const sendResponseToClient = (
  client: WsClient,
  command: Command,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): void => {
  const response = {
    type: command,
    data: JSON.stringify(data),
    id: 0,
  };

  if (client.ws) {
    // eslint-disable-next-line no-console
    console.log(
      `Send response ${command} to user with id ${client.id} and name "${client.name}"`,
    );
    client.ws.send(JSON.stringify(response));
  }
};
