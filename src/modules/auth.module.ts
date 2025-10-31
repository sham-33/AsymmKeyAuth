import { PassportModule } from "@nestjs/passport";
import { UserModule } from "./user.module";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import path from "path";
import fs from "fs";
import { AuthService } from "../services/auth.service";
import { JwtStrategy } from "../passport/jwt.strategy";
import { Module } from "@nestjs/common";
import { AuthController } from "../controllers/auth.controller";
import { KafkaModule } from "./kafka.module";
import { LoginCounterService } from "../services/loginCounter.service";
import { User } from "../entities/user.entity";

@Module({
    imports: [
        UserModule,
        PassportModule,
        KafkaModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            privateKey: fs.readFileSync(path.join(__dirname, '../../keys/private.pem')),
            publicKey: fs.readFileSync(path.join(__dirname, '../../keys/public.pem')),
            signOptions: {
                expiresIn: '3h',
                algorithm: 'RS256'
            },
        }),
    ],
    providers: [AuthService, JwtStrategy, LoginCounterService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}