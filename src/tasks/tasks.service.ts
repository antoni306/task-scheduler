import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { TaskStatus } from './task-status.enum';
import { UpdateResult } from 'typeorm/browser';
import { DeleteResult } from 'typeorm/browser';
@Injectable()
export class TasksService {
    constructor(@InjectRepository(Task) private readonly tasksRepository: Repository<Task>) {
    }
    async createTask(title: string, description: string, dueDate: Date, user: User): Promise<Task> {
        const task = this.tasksRepository.create({ title, description, dueDate, status: TaskStatus.OPEN, user });
        return this.tasksRepository.save(task);
    }
    async getTask(id: string, user: User): Promise<Task | null> {
        return this.tasksRepository.findOneBy({ id, user });
    }
    async getTasks(user: User, filter: Partial<Task>): Promise<Task[]> {
        return this.tasksRepository.find({ where: { user, ...filter } });
    }
    async udapteTask(id: string, updateTask: Partial<Task>, user: User): Promise<UpdateResult> {
        let taskToUpdate = this.tasksRepository.findBy({ id, user });
        if (!taskToUpdate)
            throw new NotFoundException(`task with id ${id} not found`);
        return this.tasksRepository.update({ id, user }, updateTask);
    }
    async deleteTask(id: string, user: User): Promise<DeleteResult> {
        return this.tasksRepository.delete({ id, user });
    }
}
