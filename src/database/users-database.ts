import { LoggedUser, User } from '../interfaces/user';

export const users: User[] = [];
export const loggedUsers: LoggedUser[] = [];

export const loggedBotUser: LoggedUser = {
  name: 'bot',
  password: '111111',
  wins: 0,
};

export const botUser: User = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'bot',
  isPlaying: false,
  isTurn: false,
};
