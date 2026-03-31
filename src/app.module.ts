import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports:
    [
      AuthModule,
      TasksModule,
      UsersModule,
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'task_scheduler',
        autoLoadEntities: true,
        synchronize: true,
      })
    ],
})
export class AppModule { }
