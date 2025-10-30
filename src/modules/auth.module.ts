import { PassportModule } from "@nestjs/passport";
import { UserModule } from "./user.module";
import { JwtModule, JwtService } from "@nestjs/jwt";
import path from "path";
import fs from "fs";
import { AuthService } from "../services/auth.service";
import { JwtStrategy } from "../passport/jwt.strategy";
import { Controller, Module } from "@nestjs/common";
import { AuthController } from "../controllers/auth.controller";
import { KafkaModule } from "./kafka.module";
import { LoginCounterService } from "../services/loginCounter.service";

@Module({
    imports: [
        UserModule,
        PassportModule,
        KafkaModule,
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