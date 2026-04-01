import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from 'src/users/dto/auth-credentials.dto';
import { AuthRegisterDto } from 'src/users/dto/auth-register.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // @Post('login')
    // signIn(@Body() signInDto: AuthCredentialsDto): Promise<{ access_token: string; }> {
    //     const { username, password } = signInDto
    //     return this.authService.signIn(username, password);
    // }

    @Post('register')
    signUp(@Body() authRegisterDto: AuthRegisterDto) {
        const { username, password, email } = authRegisterDto;
        return this.authService.signUp(username, password, email);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async signIn(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(LocalAuthGuard)
    @Post('logout')
    logout(@Request() req) {
        return req.logout()
    }
}
