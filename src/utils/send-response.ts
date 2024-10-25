import { WebSocket } from 'ws';
import { Command } from '../enums/command';
import {getWebSocketByUserId, getWebSocketByUserName, wsClients} from "../database/ws-clients-database";
import {getUserById, users} from "../database/users-database";

// export const sendResponse = (socket: WebSocket, command: Command, data: any): void => {
export const sendResponse = (userId: number | string, command: Command, data: any): void => {
    const response = {
        type: command,
        data: JSON.stringify(data),
        id: 0,
    };
    console.log(users, wsClients[0].id, wsClients[1]?.id, userId);

    const userName = getUserById(userId)?.name;
    const webSocket = getWebSocketByUserId(userId);
    // || getWebSocketByUserName(userName || '');

    console.log(`Send response ${command} to user with id ${userId} and name "${userName}":`, data);
    // socket.send(JSON.stringify(response))
    webSocket && webSocket.send(JSON.stringify(response));
}

export const sendResponse2 = (socket: WebSocket, command: Command, data: any): void => {
// export const sendResponse = (userId: number | string, command: Command, data: any): void => {
    const response = {
        type: command,
        data: JSON.stringify(data),
        id: 0,
    };
    console.log(users, wsClients[0].id, wsClients[1]?.id);
    // const webSocket = getWebSocketByUserId(userId);
    // const userName = getUserById(userId)?.name;

    console.log(`Send response ${command} to user:`, data);
    socket.send(JSON.stringify(response))
    socket.send(JSON.stringify(response));
}
