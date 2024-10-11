import {User, Winner} from '../interfaces/user';

// export const users: User[] = [{ name: 'Ann', id: 666, password: '666' }];
export const users: User[] = [];

// export const getUser = (id: number): User | undefined => {
//     return users.find((user) => user.id === id);
// };

// export const getUserByIndex = (userIndex: number): User | undefined => {
//     return users.find((user, index) => index === userIndex);
// };

export const getUserByIndex = (userIndex: number): User | undefined => {
    return users.find(user => user.index === userIndex);
};

export const getUserByName = (userName: string): User | undefined => {
    return users.find(user => user.name === userName);
};

export const currentUserName = [];

let _currentUserName = '';

export const getCurrentUserName = ():string => _currentUserName;

export const setCurrentUserName = (userName: string): void => {
    _currentUserName = userName;
};

export const getCurrentUser = (): User => getUserByName(getCurrentUserName());

export const winners: Winner[] = [];
