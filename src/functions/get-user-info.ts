import { User } from '../interfaces/user';
import { wsClients } from '../database/ws-clients-database';

export const getUserByName = (userName: string): User | undefined =>
  wsClients.find((user) => user.name === userName);

export const getUserById = (userId: string): User | undefined =>
  wsClients.find((user) => user.id === userId);
