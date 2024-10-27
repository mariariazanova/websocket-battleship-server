export interface LoggedUser {
  name: string;
  password: string;
  wins: number;
}

export interface User extends Pick<LoggedUser, 'name'> {
  id: string;
  isPlaying: boolean;
  isTurn: boolean;
  index?: number;
}
