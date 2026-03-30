import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { jwtConstants } from './constant';
import { JwtModule } from '@nestjs/jwt';
@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [UsersModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '1HOURS' }
        })
    ],
    exports: [],
})
export class AuthModule { }
