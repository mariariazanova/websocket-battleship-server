export interface User {
    id: number,
    index: number,
    name: string,
    password: string,
}

export interface UserWithIndex extends Pick<User, 'name'> {
    index: number;
}
