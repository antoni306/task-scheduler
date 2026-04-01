import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async login(user: User): Promise<{ access_token: string }> {
        const payload: JwtPayload = { sub: user.id, username: user.username };

        return { access_token: await this.jwtService.signAsync(payload) };
    }
    async validateUser(username: string, password: string): Promise<User> {
        const user = await this.usersService.getUserByUsername(username);
        if (!await this.usersService.checkPassword(password, user.password)) {
            throw new UnauthorizedException();
        }
        return user;
    }
    async signUp(username: string, password: string, email: string): Promise<User> {
        return await this.usersService.createUser(username, password, email);
    }
}
