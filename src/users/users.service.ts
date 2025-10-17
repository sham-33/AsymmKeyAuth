import { Injectable } from '@nestjs/common';

export type User = {
    userId: number;
    username: string;
    password: string;
}

const users: User[] = [
    {
        userId: 1,
        username: 'john',
        password: 'password123'
    },
    {
        userId: 2,
        username: 'chris',
        password: 'password456'
    }
]
@Injectable()
export class UsersService {
    async findUserByName(username: string): Promise<User | undefined> {
        return users.find(user => user.username === username);
    }
}
