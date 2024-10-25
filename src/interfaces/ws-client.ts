import { WebSocket } from 'ws';

export interface WsClient {
    id: number | string,
    name: string,
    ws: WebSocket,
}
