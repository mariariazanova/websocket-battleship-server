import { User } from '../interfaces/user';

export const users: User[] = [];

export const getUser = (id: string): User | undefined => {
    return users.find((user) => user.id === id);
};
