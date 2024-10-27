import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { Command } from '../enums/command';
import { registerUser } from '../commands/user-commands';
import { addUserToRoom, createRoom } from '../commands/room-commands';
import { addShips, attack, randomAttack } from '../commands/game-commands';
import { botUser, loggedBotUser, loggedUsers } from '../database/users-database';
import { getUserById } from '../functions/get-user-info';
import { wsClients } from '../database/ws-clients-database';
import { createGameResponse, finishResponse, startGameResponse } from '../responses/game-responses';
import { updateRoomResponse } from '../responses/room-responses';
import { rooms } from '../database/rooms-database'
import { updateWinnersResponse } from '../responses/user-responses';
import { getRoomByUserId, getRoomByUserName, getRoomUserByUserId } from '../functions/get-room-info';
import { initializeShipStates } from '../functions/initialize-ship-states';
import { getRandomShips } from '../functions/get-random-ships';

const WS_PORT = 3000;
export const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on('listening', () => {
  console.log(`Websocket server is running on ${WS_PORT} port`);
});

wsServer.on('connection', (wsClient: WebSocket) => {
  const userId = randomUUID();

  console.log(`New client with id ${userId} connected`);

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
        break;
      }
      case Command.ATTACK: {
        attack(data);
        break;
      }
      case Command.RANDOM_ATTACK: {
        randomAttack(data);
        break;
      }
      case Command.SINGLE_PLAY: {
        registerUser(JSON.stringify(loggedBotUser), undefined, botUser.id);
        updateRoomResponse();
        updateWinnersResponse();

        const roomId = randomUUID();

        createRoom(roomId, userId);
        updateRoomResponse();

        addUserToRoom(JSON.stringify({ indexRoom: roomId }), botUser.id);

        updateRoomResponse();
        createGameResponse(JSON.stringify({ indexRoom: roomId }), userId);

        const room = getRoomByUserName(botUser.name);
        const shipsData = JSON.stringify({
          indexPlayer: botUser.id,
          ships: initializeShipStates(getRandomShips()),
          gameId: room?.gameId,
        });

        addShips(shipsData);
        break;
      }
    }
  });

  wsClient.on('close', () => {
   console.log(`Client with id ${userId} disconnected`);

   const disconnectedUser = wsClients.find(user => user.id === userId);
   const roomWithUser = getRoomByUserId(userId);

   if (roomWithUser) {
     const roomIndex = rooms.findIndex(room => room.roomId === roomWithUser.roomId);
     const enemyRoomUser = getRoomUserByUserId(userId, false);
     const isUserPlaying = wsClients.find(user => user.name === getUserById(userId)?.name)?.isPlaying;

     if (isUserPlaying) {
       const user = loggedUsers.find(user => user.name === enemyRoomUser?.name);

       if (user) {
         user.wins += 1;
       }

       finishResponse(enemyRoomUser?.userId || '');
       updateWinnersResponse();
     }

     if (roomIndex !== -1) {
       rooms.splice(roomIndex, 1);
     }
   }

   if (disconnectedUser) {
     const userIndex = wsClients.findIndex(user => user.id === disconnectedUser.id);

     if (userIndex !== -1) {
       wsClients.splice(userIndex, 1);
     }
   }
  });

  wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);

    wsClient.close();
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  wsClients.forEach((client) => {
    if (client.ws?.readyState === WebSocket.OPEN) {
      client.ws?.close(1000, 'Server shutting down');
    }
  });

  wsServer.close(() => {
    console.log('WebSocket server closed');

    process.exit(0);
  });
});

