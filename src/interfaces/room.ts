import { User, UserWithIndex } from "./user";

export interface Room {
    roomId: number;
    roomUsers: UserWithIndex[]; //Partial<User>[];
}
