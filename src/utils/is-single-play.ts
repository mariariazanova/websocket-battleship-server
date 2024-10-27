import {loggedUsers, users} from '../database/users-database';

export const isSinglePlay = (): boolean => !!loggedUsers.find(user => user.name === 'bot');
