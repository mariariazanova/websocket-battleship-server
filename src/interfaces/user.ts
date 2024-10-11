export interface User {
    id: number,
    index: number,
    name: string,
    password: string,
}

export interface UserWithIndex extends Pick<User, 'name'> {
    index: number;
}

export interface Winner {
    id: number,
    name: string,
    wins: number,
}
