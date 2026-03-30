import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
@Injectable()
export class UsersService {
    private saltRounds = 10;
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) { }

    async getUser(username: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({ username });
        if (!user)
            throw new NotFoundException(`user with username ${username} not found`);
        return user;
    }

    async checkPassword(password, hashed): Promise<boolean> {
        return bcrypt.compare(password, hashed);
    }

    async createUser(username: string, password: string, email: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, this.saltRounds);


        const user: Partial<User> = { username, password: hashedPassword, email }

        return await this.usersRepository.save(user);
    }
}
