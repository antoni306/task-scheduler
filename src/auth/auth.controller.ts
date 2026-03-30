import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from 'src/users/dto/auth-credentials.dto';
import { AuthRegisterDto } from 'src/users/dto/auth-register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    signIn(@Body() signInDto: AuthCredentialsDto): Promise<{ access_token: string; }> {
        const { username, password } = signInDto
        return this.authService.signIn(username, password);
    }

    @Post('register')
    signUp(@Body() authRegisterDto: AuthRegisterDto) {
        const { username, password, email } = authRegisterDto;
        return this.authService.signUp(username, password, email);
    }


}
