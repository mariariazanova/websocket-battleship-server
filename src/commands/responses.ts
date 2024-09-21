import { WebSocket } from 'ws';
import { User } from '../interfaces/user';
import { users } from '../database/users-database';
import { Commands } from '../enums/commands';

export const registerResponse = (user: User, wsClient: WebSocket) => {
    const dataMessage = {
        error: true,
        errorText: "",
        name: user.name,
        id: user.id,
    };
    const existingUser = users.find(el => el.name === user.name)

    if (existingUser) {
        if (existingUser?.password === user.password) {
            dataMessage.error = false;
        } else {
            dataMessage.errorText = 'Wrong password';
        }
    } else {

            users.push(user);
            console.log('Registered user', user);
            console.log('All users', users);
            dataMessage.error = false;
    }

    wsClient.send(
        JSON.stringify({
            type: Commands.REG,
            data: JSON.stringify(dataMessage),
            id: 0,
        })
    );
    console.log('Response: ', {
        type: Commands.REG,
        data: JSON.stringify(dataMessage),
        id: 0,
    });
};
