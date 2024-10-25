export interface User {
    id: number | string,
    name: string,
    password: string,
    index?: number | string
    isPlaying?: boolean;
    isRegistered?: boolean;
    isTurn?: boolean;
}

export interface UserWithIndex extends Pick<User, 'name' | 'index'> {
    // index: number;
}

export interface Winner {
    id: number | string,
    name: string,
    wins: number,
}
