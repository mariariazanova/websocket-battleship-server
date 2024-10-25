import { WsClient } from '../interfaces/ws-client';

export const wsClients: WsClient[] = [];

export const getWebSocketByUserId = (userId: string | number) => wsClients.find(client => client.id === userId)?.ws;
