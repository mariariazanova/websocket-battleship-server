import { WsClient } from '../interfaces/ws-client';
import {getUserById} from "./users-database";
import { WebSocket } from 'ws';

export const wsClients: WsClient[] = [];

export const getWsClientByUserId = (userId: string): WsClient | undefined => wsClients.find(client => client.id === userId);
export const getWebSocketByUserId = (userId: string | number) => wsClients.find(client => client.id === userId)?.ws;
export const getWebSocketByUserName = (userName: string) => wsClients.find(client => client.id === userName)?.ws;

// export const updateWsClients = (userName: string, newUserId: number | string, newWs: WebSocket): void => {
//     const user = wsClients.find(client => client.id === userName);
//
//     if (user) {
//         user.id = newUserId;
//         user.ws = newWs;
//     }
// }