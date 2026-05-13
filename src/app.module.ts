import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GoalsModule } from './goals/goals.module';
@Module({
  imports: [
    GoalsModule,
    MongooseModule.forRoot(process.env.MONGO_URI||'mongodb://mongodb:27017/goaltracker'),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TasksModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
  ],
})
export class AppModule {}
