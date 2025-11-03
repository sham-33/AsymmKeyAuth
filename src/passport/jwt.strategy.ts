import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: fs.readFileSync(path.join(__dirname, '../../keys/public.pem')),
            algorithms: ['RS256'],
        })
    }

    async validate(payload: any) {
        return { userId: payload.sub, username: payload.username } //can be used as req.user in any controller that is protected by JwtStrategy
    }
}