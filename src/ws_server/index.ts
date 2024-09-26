import { WebSocketServer, WebSocket } from 'ws';
import { Commands } from '../enums/commands';
import { registerUser } from '../commands/user-commands';
// import { generateUuid } from '../utils/generate-uuid';
import { addUserToRoom, createRoom } from '../commands/room-commands';
import { generateUniqueId } from '../utils/generate-uuid';
import {startGameResponse, updateRoomResponse} from '../commands/responses';
import { addShips, createGame } from '../commands/game-commands';
import {currentUserName, setCurrentUserName} from "../database/users-database";
import {ships} from "../database/ships-database";

const WS_PORT = 3000;
export const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on('listening', () => {
    console.log(`Start websocket server on the ${WS_PORT} port!`);
});

wsServer.on('connection', (wsClient: WebSocket) => {
    console.log("Client connected");
    let currentUserId: number;
    // let currentUserName: string;

    wsClient.on('message', (message) => {
        console.log(`Received ${message}`);
        // const id = generateId();


        const { type, data } = JSON.parse(message.toString());

        switch (type) {
            case Commands.REG:
                const userId = generateUniqueId();
                const { name } = JSON.parse(data);

                currentUserId = userId;
                setCurrentUserName(name);
                console.log(currentUserName);

                registerUser(data, wsClient, userId);
                updateRoomResponse();
                break;
            case Commands.CREATE_ROOM: {
                console.log('create room');
                console.log('wsServer.clients', wsServer.clients.size);
                console.log(currentUserId);
                const roomId = generateUniqueId();
                console.log(currentUserName);

                createRoom(roomId);
                updateRoomResponse();
                break;
            }
            case Commands.ADD_USER_TO_ROOM: {
                console.log('add user to room');
                console.log(currentUserId);
                console.log(currentUserName);
                addUserToRoom(data, currentUserId);
                updateRoomResponse();
                createGame(data, currentUserId);
                break;
            }
            case Commands.ADD_SHIPS: {
                console.log('add ships')
                addShips(data);
                startGameResponse(ships);
                break;
            }
        }
    });
});
