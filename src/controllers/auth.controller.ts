import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: { username: string; password: string }): Promise<any> {
        return this.authService.register(body.username, body.password);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: { username: string; password: string }): Promise<any> {
        return this.authService.login(body.username, body.password);
    }
}