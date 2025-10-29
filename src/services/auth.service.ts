import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from '../services/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) { }

    async register(username: string, password: string): Promise<any> {
        const existingUser = await this.userService.findOne(username);
        if (existingUser) {
            throw new UnauthorizedException('Username already taken');
        }

        const user = await this.userService.createUser(username, password);
        const payload = { username: user.username, sub: user.id };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
            },

        };
    }

    async login(username: string, password: string): Promise<any> {
        const user = await this.userService.findOne(username);
        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username
            },
        };
    }

    async validateUser(userId: number): Promise<any> {
        const user = await this.userService.findById(userId);
        if (!user) {
            return null;
        }
        const {password, ...result} = user;
        return result;
    }
 }