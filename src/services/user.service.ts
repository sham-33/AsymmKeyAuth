import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createUser(username: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            username, password: hashedPassword,

        });
        return await this.userRepository.save(user);
    }
    
    async findOne(username: string): Promise<User | undefined> {
        return (await this.userRepository.findOne({ where: { username } })) ?? undefined;
    }

    async findById(id: number): Promise<User | undefined> {
        return (await this.userRepository.findOne({ where: { id } })) ?? undefined;
    }
}