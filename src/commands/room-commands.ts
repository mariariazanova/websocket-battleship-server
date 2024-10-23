import { Room } from '../interfaces/room';
// import { generateUuid } from '../utils/generate-uuid';
import {getCurrentUserName, getUserById, getUserByName, users} from '../database/users-database';
// import { generateId } from '../utils/generate-uuid';
import { rooms } from '../database/rooms-database';
// import { updateRoomResponse } from './responses';
// import { UserWithIndex} from "../interfaces/user";

export const createRoom = (roomId: number, userId: number): void => {
    try {
        const currentUser = getUserById(userId);
        const currentUserName = currentUser.name;
        // const currentUser = getUserByName(currentUserName);
        // console.log('currentUserName', currentUserName);
        // console.log(users, currentUserName);
        // console.log(rooms, rooms.every(room => room.roomUsers.every(user => user.name !== currentUserName)));

        if (rooms.every(room => room.roomUsers.every(user => user.name !== currentUserName))) {
            const room: Room = {
                roomId,
                roomUsers: [{ name: currentUserName || '', index: currentUser.index }],
                // roomUsers: [{ name: users[0].name || '', index: users[0].id }],
            };

            rooms.push(room);
            console.log(rooms);
        }

        // const room: Room = {
        //     roomId,
        //     roomUsers: [{ name: currentUserName || '', index: currentUser.index }],
        //     // roomUsers: [{ name: users[0].name || '', index: users[0].id }],
        // };

        // rooms.push(room);
        // console.log(rooms);
        // updateRoomResponse();

    } catch (error) {
        throw new Error(
            error instanceof Error ? error.message : 'createRoom error'
        );
    }
}

export function addUserToRoom(data: any, userId: number): void {
    console.log('addUserToRoom', data, userId);
    console.log(rooms);
    // console.log(users);
    // console.log(userId);
    const { indexRoom } = JSON.parse(data);


    const currentUser = getUserById(userId);
    const currentUserName = currentUser.name;
    console.log(currentUserName, currentUser)

    // const user =
    //     users.find(user => user.index === userId);
    // const user =
    //     users.find(user => user.id === userId);
    const roomUser = {
        name: currentUserName,
        index: currentUser.index,
        // index: user.id,
    };
    // if (!user) return [];
    // const roomUser: UserWithIndex = {
    //     name: user.name,
    //     index: wsIndex,
    // }
    const room = rooms.find(item => item.roomId === indexRoom);
    // if (!room) return [];
    // if (!room.roomUsers.filter(item => item.index !== wsIndex).length) return [];
    if (room.roomUsers.length === 1) {
        // add user to existing room
        room.roomUsers.push(roomUser);
        room.roomUsers.forEach(user => getUserByName(user.name).isPlaying = true);

        // delete room created by user
        const index = rooms.findIndex(room => room.roomUsers.length === 1 && room.roomUsers.find(user => user.name === currentUserName));

// If the object is found, remove it from the array
        if (index !== -1) {
            rooms.splice(index, 1);
        }

        // rooms = rooms.filter(room => room.roomUsers.length === 1 && room.roomUsers.find(user => user.name === currentUserName));
    }


    //
    // const players: Players = room.roomUsers.map(item => item.index);
    //
    // deleteRoom(wsIndex);
    //
    // return players;
}
