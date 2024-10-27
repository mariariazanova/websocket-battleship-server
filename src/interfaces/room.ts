import { ShipsPerUser } from "./ship";

export interface Room {
  roomId: string;
  roomUsers: ShipsPerUser[];
  gameId?: string;
}
