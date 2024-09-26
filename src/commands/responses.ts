import { WebSocket } from 'ws';
import { User } from '../interfaces/user';
import { getCurrentUserName, getUserByIndex, getUserByName, users } from '../database/users-database';
import { Commands } from '../enums/commands';
import { rooms } from '../database/rooms-database';
import { wsServer } from '../ws_server';
import { ShipsPerUser } from '../interfaces/ship';

export const registerResponse = (user: User, wsClient: WebSocket): void => {
    const dataMessage = {
        error: true,
        errorText: "",
        name: user.name,
        index: user.index,
        // id: user.id,
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
            // id: user.id,
        })
    );
    console.log('Response: ', {
        type: Commands.REG,
        data: JSON.stringify(dataMessage),
        id: 0,
        // id: user.id,
    });
};

export const updateRoomResponse = (): void => {
    const currentUserName = getCurrentUserName();
    // const currentUser = getUserByName(currentUserName);
    console.log('update room', currentUserName);
    console.log(rooms, rooms[0]?.roomUsers, rooms[1]?.roomUsers, currentUserName);
    // const response = {
    //     type: Commands.UPDATE_ROOM,
    //     data: JSON.stringify(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== currentUserName)),
    //     id: 0,
    //     // id: rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].index !== userId)[0]?.roomId,
    // }

    let index = 0;
    // const currentUser = getUserByIndex(index);
    // console.log(currentUser);
    //
    const getResponse = (index: number) => ({
        type: Commands.UPDATE_ROOM,
        data: JSON.stringify(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index)?.name)),
        // id: rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].index !== userId)[0]?.roomId,
        id: 0,
    });

    // wsServer.clients.forEach(item => {
    //     // console.log(item);
    //     item.send(JSON.stringify(response));
    // });

    // console.log('Response update room: ', response);

    // users.forEach(item => {
    //     console.log('HEY', users, index, getUserByIndex(index));
    //     console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index).name));
    //     item.send(JSON.stringify(getResponse(index)));
    //     console.log('Response update room: ', getResponse(index));
    //     index++;
    // });

    wsServer.clients.forEach(item => {
        console.log('HEY', users, index, getUserByIndex(index), rooms, rooms[0]?.roomUsers);
        console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index)?.name));
        getUserByIndex(index) && item.send(JSON.stringify(getResponse(index)));
        console.log('Response update room: ', getResponse(index));
        index++;
    });
};

export const startGameResponse = (ships: ShipsPerUser[]): void => {
    console.log(ships);

    let index = 0;

    const getResponse = (index: number) => ({
        type: Commands.START_GAME,
        data: JSON.stringify({
            ships: ships.filter((ship) => ship.userId == getUserByIndex(index).id),
            currentPlayerIndex: getUserByIndex(index).id,
        }),
        // id: rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].index !== userId)[0]?.roomId,
        id: 0,
    });

    wsServer.clients.forEach(item => {
        // console.log('HEY', users, index, getUserByIndex(index));
        // console.log(rooms.filter((room) => room.roomUsers.length === 1 && room.roomUsers[0].name !== getUserByIndex(index).name));
        item.send(JSON.stringify(getResponse(index)));
        console.log('Response start game: ', getResponse(index));
        index++;
    });
};
