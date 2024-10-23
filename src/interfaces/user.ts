export interface User {
    id: number,
    name: string,
    password: string,
    index?: number,
    isPlaying?: boolean;
}

export interface UserWithIndex extends Pick<User, 'name' | 'index'> {
    // index: number;
}

export interface Winner {
    id: number,
    name: string,
    wins: number,
}
