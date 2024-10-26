import { users } from '../database/users-database';
import {wsClients} from "../database/ws-clients-database";

export const isUserPlayingInGame = (id: string): boolean => wsClients.find(user => user.id === id)?.isPlaying ?? false;