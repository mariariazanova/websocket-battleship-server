export interface LoggedUser {
  name: string;
  password: string;
  // index?: number | string
  // isPlaying?: boolean;
  // isRegistered: boolean;
  // isTurn?: boolean;
  wins: number;
}


export interface User extends Pick<LoggedUser, 'name'> {
    id: string;
    // name: string,
    // password: string,
    index?: number;
    isPlaying: boolean;
    // isRegistered?: boolean;
    isTurn: boolean;
}

// export interface LoggedUser extends Pick<User, 'name' | 'password'> {
//     isRegistered: boolean;
// }

export interface UserWithIndex extends Pick<User, 'name' | 'index'> {
    // index: number;
}

export interface Winner extends Pick<LoggedUser, 'name' | 'wins'> {
    // id: number | string,
    // name: string,
    // wins: number,
}
