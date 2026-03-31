import { User } from "src/users/user.entity";
import { TaskStatus } from "./task-status.enum";
import { Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm";
@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    title: string;
    @Column()
    description: string;
    @Column()
    dueDate: Date;
    @Column()
    taskStatus: TaskStatus;
    @ManyToOne(_type => User, user => user.tasks)
    user: User;
}