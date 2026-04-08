import { Injectable, NotFoundException, Search } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from './task-status.enum';
import { UpdateResult } from 'typeorm/browser';
import { DeleteResult } from 'typeorm/browser';
import { FilterTaskDto } from './dto/filter-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from 'src/users/user.entity';
@Injectable()
export class TasksService {
    constructor(@InjectRepository(Task) private readonly tasksRepository: Repository<Task>) { }
    async createTask(title: string, description: string, dueDate: Date, user: User): Promise<Task> {
        try {
            const task = this.tasksRepository.create({ title, description, dueDate, taskStatus: TaskStatus.OPEN, user: user });
            return this.tasksRepository.save(task);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async getTask(id: string, user: User): Promise<Task> {
        const task = await this.tasksRepository.findOneBy({ id, user });
        if (!task)
            throw new NotFoundException(`Task with id: ${id} not found`);
        return task;
    }
    async getTasks(user: User, filter: FilterTaskDto): Promise<Task[]> {
        const query = this.tasksRepository.createQueryBuilder('task');
        query.andWhere({ user });

        if (filter.title) {
            query.andWhere('(LOWER(task.title) ILIKE :search) ', { search: `%${filter.title}%` });
        }
        if (filter.description) {
            query.andWhere('(LOWER(task.description) ILIKE :searchDesc) ', { searchDesc: `%${filter.description}%` });
        }
        if (filter.dueDate) {
            query.andWhere('DATE(task.dueDate) <= :date', { date: filter.dueDate });
        }
        if (filter.taskStatus) {
            query.andWhere('task.taskStatus = :status', { status: filter.taskStatus });
        }
        return query.getMany();
    }
    async updateTask(id: string, updateTask: UpdateTaskDto, user: User): Promise<UpdateResult> {
        const updateResult = await this.tasksRepository.update({ id, user }, { ...updateTask });
        if (!updateResult.affected) {
            throw new NotFoundException(`task with id ${id} not found`);
        }
        return updateResult;
    }
    async deleteTask(id: string, user: User): Promise<DeleteResult> {
        const deleteResult = await this.tasksRepository.delete({ id, user });
        if (!deleteResult.affected) {
            throw new NotFoundException(`task with id ${id} not found`);
        }
        return deleteResult;
    }
}
