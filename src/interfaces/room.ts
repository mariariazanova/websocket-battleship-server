import { UserWithIndex } from './user';
import { ShipsPerUser } from "./ship";

export interface Room {
  roomId: string;
  roomUsers: ShipsPerUser[];
  gameId?: string;
}
