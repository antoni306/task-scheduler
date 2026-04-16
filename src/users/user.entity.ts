import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { Exclude } from 'class-transformer';
@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @OneToMany(_type => Task, task => task.user)
    tasks: Task[];
}