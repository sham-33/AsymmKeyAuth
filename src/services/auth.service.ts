import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../services/user.service";
import * as bcrypt from "bcrypt";
import { KafkaProducerService } from "./kafkaProducer.service";
import { LoginCounterService } from "./loginCounter.service";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private kafkaProducer: KafkaProducerService,
        private loginCounter: LoginCounterService,
    ) { }

    async register(username: string, password: string): Promise<any> {
        const existingUser = await this.userService.findOne(username);
        if (existingUser) {
            throw new UnauthorizedException("Username already taken");
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
        try {
            const user = await this.userService.findOne(username);
            if (!user) throw new UnauthorizedException("Invalid credentials");

            const currentLoginCount = await this.loginCounter.getLoginCount(username);
            if (this.loginCounter.isBlocked(currentLoginCount)) {
                throw new UnauthorizedException("Login limit reached. Maximum 3 logins allowed.");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException("Invalid credentials");
            }


            await this.kafkaProducer.sendLoginEvent(username);

            const payload = { username: user.username, sub: user.id };

            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    username: user.username,
                    loginCount: currentLoginCount + 1,
                },
            };
        } catch (error) {
            console.error("Login error:", error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException("Login failed");
        }
    }

    async validateUser(userId: number): Promise<any> {
        const user = await this.userService.findById(userId);
        if (!user) return null;
        const { password, ...result } = user;
        return result;
    }
}