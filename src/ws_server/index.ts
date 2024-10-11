import { WebSocketServer, WebSocket } from 'ws';
import { Command } from '../enums/command';
import { registerUser } from '../commands/user-commands';
// import { generateUuid } from '../utils/generate-uuid';
import { addUserToRoom, createRoom } from '../commands/room-commands';
import { generateUniqueId } from '../utils/generate-uuid';
import {
    getRandomShips, initializeShipStates,
    startGameResponse,
    turnResponse,
    updateRoomResponse,
    updateWinnersResponse
} from '../commands/responses';
import {addShips, attack, createGame, randomAttack, singlePlay} from '../commands/game-commands';
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
            case Command.REG:
                console.log('register user');
                const userId = generateUniqueId();
                const { name } = JSON.parse(data);

                currentUserId = userId;
                setCurrentUserName(name);
                console.log(currentUserName);

                registerUser(data, wsClient, userId);
                updateRoomResponse();
                updateWinnersResponse();
                break;
            case Command.CREATE_ROOM: {
                console.log('create room');
                console.log('wsServer.clients', wsServer.clients.size);
                console.log(currentUserId);
                const roomId = generateUniqueId();
                console.log(currentUserName);

                createRoom(roomId);
                updateRoomResponse();
                break;
            }
            case Command.ADD_USER_TO_ROOM: {
                console.log('add user to room');
                console.log(currentUserId);
                console.log(currentUserName);
                addUserToRoom(data, currentUserId);
                updateRoomResponse();
                createGame(data, currentUserId);
                break;
            }
            case Command.ADD_SHIPS: {
                console.log('add ships')
                addShips(data);
                ships.length === 2 && startGameResponse();
                turnResponse();
                break;
            }
            case Command.ATTACK: {
                console.log('attack');
                attack(data);
                break;
            }
            case Command.RANDOM_ATTACK: {
                console.log('random attack');
                console.log(data);
                randomAttack(data);
                // const data = JSON.parse(request.data);
                // const attackResult = attack(data.gameId, data.indexPlayer);
                // if (attackResult) {
                //     sendAttackResult(attackResult);
                //     checkBot(data.gameId, data.indexPlayer);
                // };
                break;
            }
            case Command.SINGLE_PLAY: {
                console.log('single play');
                // singlePlay(data);
                registerUser(JSON.stringify({ name: 'bot', password: 'bot' }), wsClient, 111111);
                updateRoomResponse();
                updateWinnersResponse();

                const roomId = generateUniqueId();

                createRoom(roomId);
                updateRoomResponse();

                addUserToRoom(JSON.stringify({ indexRoom: roomId }), currentUserId);
                addUserToRoom(JSON.stringify({ indexRoom: roomId }), 111111);

                updateRoomResponse();
                createGame(data, currentUserId);
                console.log('bot ships', getRandomShips());
                addShips(JSON.stringify({
                    indexPlayer: 111111,
                    ships: initializeShipStates(getRandomShips()),
                }));

                ships.length === 2 && startGameResponse();
                turnResponse();

                break;
            }
        }
    });
});
