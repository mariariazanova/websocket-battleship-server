import { WebSocket } from 'ws';
import { Command } from '../enums/command';
import {getWebSocketByUserId} from "../database/ws-clients-database";
import {getUserById} from "../database/users-database";

// export const sendResponse = (socket: WebSocket, command: Command, data: any): void => {
export const sendResponse = (userId: number | string, command: Command, data: any): void => {
    const response = {
        type: command,
        data: JSON.stringify(data),
        id: 0,
    };
    const webSocket = getWebSocketByUserId(userId);
    const userName = getUserById(userId)?.name;

    console.log(`Send response ${command} to user with id ${userId} and name "${userName}":`, data);
    // socket.send(JSON.stringify(response))
    webSocket && webSocket.send(JSON.stringify(response));
}
