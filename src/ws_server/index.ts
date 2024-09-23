import { WebSocketServer, WebSocket } from 'ws';
import { Commands } from '../enums/commands';
import { registerUser } from '../commands/user-commands';
// import { generateUuid } from '../utils/generate-uuid';
import { addUserToRoom, createRoom } from '../commands/room-commands';
import { generateUniqueId } from '../utils/generate-uuid';
import { updateRoomResponse } from '../commands/responses';

const WS_PORT = 3000;
export const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on('listening', () => {
    console.log(`Start websocket server on the ${WS_PORT} port!`);
});

wsServer.on('connection', (wsClient: WebSocket) => {
    console.log("Client connected");
    let currentUserId: number;

    wsClient.on('message', (message) => {
        console.log(`Received ${message}`);
        // const id = generateId();


        const { type, data } = JSON.parse(message.toString());

        switch (type) {
            case Commands.REG:
                const userId = generateUniqueId();

                currentUserId = userId;

                registerUser(data, wsClient, userId);
                updateRoomResponse(currentUserId);
                break;
            case Commands.CREATE_ROOM: {
                console.log('wsServer.clients', wsServer.clients.size);
                console.log(currentUserId);
                const roomId = generateUniqueId();

                createRoom(roomId);
                updateRoomResponse(currentUserId);
                break;
            }
            case Commands.ADD_USER_TO_ROOM: {
                console.log('add user to room');
                console.log(currentUserId);
                addUserToRoom(data, currentUserId);
                updateRoomResponse(currentUserId);
                break;
            }
        }
    });
});
