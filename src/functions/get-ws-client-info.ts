import { wsClients } from '../database/ws-clients-database';

export const getWebSocketByUserId = (userId: string | number) => wsClients.find(client => client.id === userId)?.ws;
