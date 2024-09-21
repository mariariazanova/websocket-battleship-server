import { WebSocket } from 'ws';
import { User } from '../interfaces/user';
import { registerResponse } from './responses';

export const registerUser = (data: string, wsClient: WebSocket, id: string) => {
    try {
        const { name, password } = JSON.parse(data);
        const user: User = {
            id,
            name: name.trim(),
            password: password.trim(),
        };

        registerResponse(user, wsClient);

    } catch (error) {

    }
};
