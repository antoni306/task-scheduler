import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:
    [
      ConfigModule.forRoot({ isGlobal: true }),
      AuthModule,
      TasksModule,
      UsersModule,
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.HOST_DB || 'localhost',
        port: parseInt(process.env.PORT_DB ?? '5432'),
        username: process.env.USERNAME_DB,
        password: process.env.PASSWORD_DB,
        database: process.env.DATABASE,
        autoLoadEntities: true,
        synchronize: true,
      }),
    ],
})
export class AppModule { }
