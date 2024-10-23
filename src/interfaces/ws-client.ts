import { WebSocket } from 'ws';

export interface WsClient {
    id: number,
    name: string,
    ws: WebSocket,
}
