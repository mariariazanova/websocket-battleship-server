import { WebSocketServer, WebSocket } from 'ws';
import { Commands } from '../enums/commands';
import { registerUser } from '../commands/user-commands';

const WS_PORT = 3000;
export const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer.on('listening', () => {
    console.log(`Start websocket server on the ${WS_PORT} port!`);
});

wsServer.on('connection', (wsClient: WebSocket) => {
    console.log("Client connected");

    wsClient.on('message', (message) => {
        console.log(`Received ${message}`);
        const id = '1';

        const { type, data } = JSON.parse(message.toString());

        switch (type) {
            case Commands.REG: {
                registerUser(data, wsClient, id);
                break;
            }
        }
    });
});
