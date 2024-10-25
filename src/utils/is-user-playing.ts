import { users } from '../database/users-database';

export const isUserPlayingInGame = (id: number | string): boolean => users.find(user => user.id === id)?.isPlaying ?? false;