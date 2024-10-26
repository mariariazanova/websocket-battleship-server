import {LoggedUser, User, Winner} from '../interfaces/user';
import {wsClients} from "./ws-clients-database";

// export const users: User[] = [{ name: 'Ann', id: 666, password: '666' }];
export const users: User[] = [];
export const loggedUsers: LoggedUser[] = [];

// export const getLoggedUsers = (): LoggedUser[] => users.map(({ name, password }) => ({ name, password }))

// export const getUser = (id: number): User | undefined => {
//     return users.find((user) => user.id === id);
// };

// export const getUserByIndex = (userIndex: number): User | undefined => {
//     return users.find((user, index) => index === userIndex);
// };

export const getUserByIndex = (userIndex: number): User | undefined => {
    return wsClients.find(user => user.index === userIndex);
};

export const getUserByName = (userName: string): User | undefined => {
    return wsClients.find(user => user.name === userName);
};

export const getUserById = (userId: string): User | undefined => {
    return wsClients.find(user => user.id === userId);
};

// export const updateUser = (userId: string, newUserId: string): void => {
//     const user = getUserById(userId);
//
//     if (user) {
//         user.id = newUserId;
//     }
// }

// export const updateUserRegisteredState = (userName: string): void => {
//     const user = getUserByName(userName);
//
//     if (user) {
//         user.isRegistered = true;
//     }
// }
// export const updateUserRegisteredState = (userName: string): void => {
//     const user = wsClients.find(user => user.name === userName);
//
//     if (user) {
//         user.isRegistered = true;
//     }
// }

// export const currentUserName = [];

// let _currentUserName = '';

// export const getCurrentUserName = ():string => _currentUserName;

// export const setCurrentUserName = (userName: string): void => {
//     _currentUserName = userName;
// };

// export const getCurrentUser = (): User | undefined => getUserByName(getCurrentUserName());

export const winners: Winner[] = [];
