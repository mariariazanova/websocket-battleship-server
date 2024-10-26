import { WebSocket } from 'ws';
import {LoggedUser, User} from '../interfaces/user';
import { registerResponse } from '../responses/user-responses';
import {WsClient} from "../interfaces/ws-client";
import {wsClients} from "../database/ws-clients-database";

export const registerUser = (data: string, wsClient: WebSocket, userId: string) => {
  const { name, password } = JSON.parse(data);
  const loggedUser: LoggedUser = {
    name: name.trim(),
    password: password.trim(),

    wins: 0,
  };
  const newWsClient: WsClient = {
    name: loggedUser.name,
    id: userId,
    // index: number,
    isPlaying: false,
    // isRegistered: false,
    isTurn: false,
    ws: wsClient,
  };

  registerResponse(loggedUser, newWsClient);
};
