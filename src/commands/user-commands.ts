import { WebSocket } from 'ws';
import { User } from '../interfaces/user';
import { registerResponse } from './responses';
import { users } from '../database/users-database';

export const registerUser = (data: string, wsClient: WebSocket, userId: number) => {
    try {
        const { name, password } = JSON.parse(data);
        const user: User = {
            // index: users.length,
            id: userId,
            name: name.trim(),
            password: password.trim(),
        };

        registerResponse(user, wsClient);
        // updateRoomResponse();

    } catch (error) {

    }
};
