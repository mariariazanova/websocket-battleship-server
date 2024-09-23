export interface User {
    id: number,
    name: string,
    password: string,
}

export interface UserWithIndex extends Pick<User, 'name'> {
    index: number;
}
