import { botUser, loggedUsers } from '../database/users-database';

export const isSinglePlay = (): boolean =>
  !!loggedUsers.find((user) => user.name === botUser.name);
