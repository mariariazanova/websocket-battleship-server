import { WebSocket } from 'ws';

export interface WsClient {
    name: string;
    id: string;
    index?: number;
    isPlaying: boolean;
    // isRegistered: boolean;
    isTurn: boolean;
    ws: WebSocket;
}
