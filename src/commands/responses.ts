import { WebSocket } from 'ws';
import { User } from '../interfaces/user';
import { users } from '../database/users-database';
import { Commands } from '../enums/commands';
import { rooms } from '../database/rooms-database';
import { wsServer } from '../ws_server';

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
            id: user.id,
        })
    );
    console.log('Response: ', {
        type: Commands.REG,
        data: JSON.stringify(dataMessage),
        id: user.id,
    });
};

export const updateRoomResponse = (userId: number) => {
    console.log('update room');
    console.log(rooms, rooms[0]?.roomUsers, rooms[1]?.roomUsers);
    const response = {
        type: Commands.UPDATE_ROOM,
        data: JSON.stringify(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].index !== userId)),
        id: rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].index !== userId)[0]?.roomId,
    }

    wsServer.clients.forEach(item => {
        item.send(JSON.stringify(response));
    });

    console.log('Response: ', response
    );
};
