import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async signIn(username: string, password: string): Promise<{ access_token: string }> {
        const user = await this.usersService.getUser(username);

        if (!await this.usersService.checkPassword(password, user.password)) {
            throw new UnauthorizedException();
        }

        const payload: JwtPayload = { sub: user.id, username: user.username };

        return { access_token: await this.jwtService.signAsync(payload) };
    }

    async signUp(username: string, password: string, email: string): Promise<User> {
        return await this.usersService.createUser(username, password, email);
    }
}
