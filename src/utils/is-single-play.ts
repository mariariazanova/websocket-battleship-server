import { users } from '../database/users-database';

export const isSinglePlay = (): boolean => !!users.find(user => user.name === 'bot');
