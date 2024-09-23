import { Room } from '../interfaces/room';
// import { generateUuid } from '../utils/generate-uuid';
import { users } from '../database/users-database';
// import { generateId } from '../utils/generate-uuid';
import { rooms } from '../database/rooms-database';
// import { updateRoomResponse } from './responses';
// import { UserWithIndex} from "../interfaces/user";

export const createRoom = (roomId: number): void => {
    try {
        const room: Room = {
            roomId,
            roomUsers: [{ name: users[0].name || '', index: users[0].id }],
        };

        rooms.push(room);
        console.log(rooms);
        // updateRoomResponse();

    } catch (error) {
        throw new Error(
            error instanceof Error ? error.message : 'createRoom error'
        );
    }
}

export function addUserToRoom(data: any, userId: number): void {
    console.log(data);
    console.log(rooms);
    console.log(users);
    console.log(userId);
    const { indexRoom } = JSON.parse(data);

    const user = users.find(user => user.id === userId);
    const roomUser = {
        name: user.name,
        index: user.id,
    };
    // if (!user) return [];
    // const roomUser: UserWithIndex = {
    //     name: user.name,
    //     index: wsIndex,
    // }
    const room = rooms.find(item => item.roomId === indexRoom);
    // if (!room) return [];
    // if (!room.roomUsers.filter(item => item.index !== wsIndex).length) return [];
    room.roomUsers.push(roomUser);
    //
    // const players: Players = room.roomUsers.map(item => item.index);
    //
    // deleteRoom(wsIndex);
    //
    // return players;
}
