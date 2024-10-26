import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { Command } from '../enums/command';
import { registerUser } from '../commands/user-commands';
import { addUserToRoom, createRoom } from '../commands/room-commands';
import {
    finishResponse,
    getRandomShips, initializeShipStates,
} from '../commands/responses';
import { addShips, attack, randomAttack } from '../commands/game-commands';
import {getUserById, getUserByName, loggedUsers, users} from '../database/users-database';
import { wsClients } from '../database/ws-clients-database';
import { createGameResponse, startGameResponse, turnResponse } from '../responses/game-responses';
import { updateRoomResponse } from '../responses/room-responses';
import { updateWinnersResponse } from '../responses/user-responses';
import {rooms} from "../database/rooms-database";

const WS_PORT = 3000;
export const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on('listening', () => {
    console.log(`Websocket server is running on ${WS_PORT} port`);
    // console.log(users, loggedUsers);
});

wsServer.on('connection', (wsClient: WebSocket) => {
  const userId = randomUUID();
    console.log(`New client with id ${userId} connected`);
    console.log(loggedUsers, rooms);
    console.log(wsClients[0]?.id, wsClients[0]?.index, wsClients[0]?.name, wsClients[0]?.isPlaying, wsClients[0]?.isTurn);
    console.log(wsClients[1]?.id, wsClients[1]?.index, wsClients[1]?.name, wsClients[1]?.isPlaying, wsClients[1]?.isTurn);
    console.log(wsClients[2]?.id, wsClients[2]?.index, wsClients[2]?.name, wsClients[2]?.isPlaying, wsClients[2]?.isTurn);

  wsClient.on('message', (message) => {
    const { type, data, id } = JSON.parse(message.toString());

    console.log('Received command:', { type, data: data.length ? JSON.parse(data) : '', id });

    switch (type) {
      case Command.REG:
        registerUser(data, wsClient, userId);
        updateRoomResponse();
        updateWinnersResponse();
        break;
      case Command.CREATE_ROOM: {
        const roomId = randomUUID();

        createRoom(roomId, userId);
        updateRoomResponse();
        break;
      }
      case Command.ADD_USER_TO_ROOM: {
        addUserToRoom(data, userId);
        updateRoomResponse();
        createGameResponse(data, userId);
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
                registerUser(JSON.stringify({ name: 'bot', password: 'bot' }), wsClient, '111111');
                updateRoomResponse();
                updateWinnersResponse();

                const roomId = randomUUID();

                createRoom(roomId, userId);
                updateRoomResponse();

                addUserToRoom(JSON.stringify({ indexRoom: roomId }), userId);
                addUserToRoom(JSON.stringify({ indexRoom: roomId }), '111111');

                updateRoomResponse();
                createGameResponse(data, userId);
                console.log('bot ships', getRandomShips());
                const shipsData = JSON.stringify({
                    indexPlayer: 111111,
                    ships: initializeShipStates(getRandomShips()),
                });
                addShips(shipsData);
                startGameResponse(shipsData);
                turnResponse('88');

                break;
            }
    }
  });

  wsClient.on('close', () => {
   console.log(`Client with id ${userId} disconnected`);

   const disconnectedUser = wsClients.find(user => user.id === userId);
   const disconnectedLoggedUser = loggedUsers.find(user => user.name === disconnectedUser?.name);
   const roomWithUser = rooms.find(room => room.roomUsers.some(roomUser => roomUser.name === getUserById(userId)?.name));

   if (roomWithUser) {
       const roomIndex = rooms.findIndex(room => room.roomId === roomWithUser.roomId);
       const roomUsers = roomWithUser.roomUsers;
       const enemyUserName = roomUsers?.find(user => user.userId !== userId)?.name;
       const isUserPlaying = wsClients.find(user => user.name === getUserById(userId)?.name)?.isPlaying;

       if (isUserPlaying) {
           const user = loggedUsers.find(user => user.name === enemyUserName);

           if (user) {
               user.wins += 1;
           }

           // wsClients.find(user => user.name === enemyUserName)?.ws.send();
           finishResponse(getUserByName(<string>enemyUserName)?.id || '');
           updateWinnersResponse();
       }

       if (roomIndex !== -1) {
           rooms.splice(roomIndex, 1);
       }
   }

   // if (disconnectedLoggedUser) {
   //     disconnectedLoggedUser.isRegistered = false;
   // }

   if (disconnectedUser) {
       // users.filter(user => user.id !== disconnectedUser.id);
       const userIndex = wsClients.findIndex(user => user.id === disconnectedUser.id);

       if (userIndex !== -1) {
           wsClients.splice(userIndex, 1);
       }

       // const wsIndex = wsClients.findIndex(ws => ws.id === disconnectedUser.id);
       //
       // if (userIndex !== -1) {
       //     wsClients.splice(userIndex, 1);
       // }
   }
   // console.log(disconnectedUser, disconnectedLoggedUser, users, loggedUsers);
   //
   // console.log('777', wsClient.readyState);
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

