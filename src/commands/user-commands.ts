import { WebSocket } from 'ws';
import { LoggedUser } from '../interfaces/user';
import { WsClient } from '../interfaces/ws-client';
import { registerResponse } from '../responses/user-responses';

export const registerUser = (data: string, wsClient: WebSocket, userId: string): void => {
  const { name, password } = JSON.parse(data);
  const loggedUser: LoggedUser = {
    name: name.trim(),
    password: password.trim(),
    wins: 0,
  };
  const newWsClient: WsClient = {
    name: loggedUser.name,
    id: userId,
    isPlaying: false,
    isTurn: false,
    ws: wsClient,
  };

  registerResponse(loggedUser, newWsClient);
};
