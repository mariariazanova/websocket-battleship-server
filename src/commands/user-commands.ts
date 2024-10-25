import { WebSocket } from 'ws';
import { User } from '../interfaces/user';
import { registerResponse } from '../responses/user-responses';

export const registerUser = (data: string, wsClient: WebSocket, userId: number) => {
  const { name, password } = JSON.parse(data);
  const user: User = {
    id: userId,
    name: name.trim(),
    password: password.trim(),
  };

  registerResponse(user, wsClient);
};
