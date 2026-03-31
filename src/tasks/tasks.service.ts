import { Injectable, NotFoundException, Search } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { TaskStatus } from './task-status.enum';
import { UpdateResult } from 'typeorm/browser';
import { DeleteResult } from 'typeorm/browser';
import { UsersService } from 'src/users/users.service';
import { FilterTaskDto } from './dto/filter-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
@Injectable()
export class TasksService {
    constructor(@InjectRepository(Task) private readonly tasksRepository: Repository<Task>, private readonly usersService: UsersService) { }
    async createTask(title: string, description: string, dueDate: Date, userId: string): Promise<Task> {
        const user = await this.usersService.getUser(userId);
        const task = { title, description, dueDate, status: TaskStatus.OPEN, user };
        return this.tasksRepository.save(task);
    }
    async getTask(id: string, userId: string): Promise<Task> {
        const user = await this.usersService.getUser(userId);
        const task = await this.tasksRepository.findOneBy({ id, user });
        if (!task)
            throw new NotFoundException(`Task with id: ${id} not found`);
        return task;
    }
    async getTasks(userId: string, filter: FilterTaskDto): Promise<Task[]> {
        const user = await this.usersService.getUser(userId);
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
    async updateTask(id: string, updateTask: UpdateTaskDto, userId: string): Promise<UpdateResult> {
        return this.tasksRepository.update({ id, user: { id: userId } }, { ...updateTask });
    }
    async deleteTask(id: string, userId: string): Promise<DeleteResult> {
        const deleteResult = await this.tasksRepository.delete({ id, user: { id: userId } });
        if (!deleteResult.affected) {
            throw new NotFoundException(`no task with id ${id} found`);
        }
        return deleteResult;
    }
}
