import { User } from '../interfaces/user';

// export const users: User[] = [{ name: 'Ann', id: 666, password: '666' }];
export const users: User[] = [];

export const getUser = (id: number): User | undefined => {
    return users.find((user) => user.id === id);
};
