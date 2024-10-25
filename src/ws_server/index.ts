import { WebSocketServer, WebSocket } from 'ws';
import { Command } from '../enums/command';
import { registerUser } from '../commands/user-commands';
import { addUserToRoom, createRoom } from '../commands/room-commands';
import { generateUniqueId } from '../utils/generate-uuid';
import {
    getRandomShips, initializeShipStates,
} from '../commands/responses';
import { addShips, attack, randomAttack } from '../commands/game-commands';
import { users } from '../database/users-database';
import { wsClients } from '../database/ws-clients-database';
import { createGameResponse, startGameResponse, turnResponse } from '../responses/game-responses';
import { updateRoomResponse } from '../responses/room-responses';
import { updateWinnersResponse } from '../responses/user-responses';

const WS_PORT = 3000;
export const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on('listening', () => {
    console.log(`Start websocket server on the ${WS_PORT} port!`);
});

wsServer.on('connection', (wsClient: WebSocket) => {
  console.log('New client connected');
  let currentUserId: number;

  wsClient.on('message', (message) => {
    const { type, data, id } = JSON.parse(message.toString());

    console.log('Received command:', { type, data: data.length ? JSON.parse(data) : '', id });

    switch (type) {
      case Command.REG:
        const userId = generateUniqueId();

        currentUserId = userId;
        registerUser(data, wsClient, userId);
        updateRoomResponse();
        updateWinnersResponse();
        break;
      case Command.CREATE_ROOM: {
        const roomId = generateUniqueId();

        createRoom(roomId, currentUserId);
        updateRoomResponse();
        break;
      }
      case Command.ADD_USER_TO_ROOM: {
        addUserToRoom(data, currentUserId);
        updateRoomResponse();
        createGameResponse(data, currentUserId);
        break;
      }
      case Command.ADD_SHIPS: {
        addShips(data);
        startGameResponse(data);
        // turnResponse();
        break;
      }
      case Command.ATTACK: {
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

                createRoom(roomId, currentUserId);
                updateRoomResponse();

                addUserToRoom(JSON.stringify({ indexRoom: roomId }), currentUserId);
                addUserToRoom(JSON.stringify({ indexRoom: roomId }), 111111);

                updateRoomResponse();
                createGameResponse(data, currentUserId);
                console.log('bot ships', getRandomShips());
                const shipsData = JSON.stringify({
                    indexPlayer: 111111,
                    ships: initializeShipStates(getRandomShips()),
                });
                addShips(shipsData);
                startGameResponse(shipsData);
                turnResponse(88);

                break;
            }
    }
  });

  wsClient.on('close', () => {
   console.log('Client disconnected', currentUserId);

   const disconnectedUser = users.find(user => user.id === currentUserId);

   if (disconnectedUser) {
     disconnectedUser.isRegistered = false;
   }
   console.log(users);

   console.log('777', wsClient.readyState);
  });

  wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsClient.close();
    console.log('WebSocket server closed');
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  wsClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.close(1000, 'Server shutting down');
    }
  });

  wsServer.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

