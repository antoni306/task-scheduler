import { Controller, UseGuards, Post, Body, Param, Get } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { GetUser } from 'src/auth/get-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';
import { Task } from './task.entity';
import { FilterTaskDto } from './dto/filter-task.dto';
@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Post()
    createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() payload: JwtPayload): Promise<Task> {
        const { title, description, dueDate } = createTaskDto;
        return this.tasksService.createTask(title, description, dueDate, payload.sub);
    }


    @Get(':id')
    getTask(@Param('id') id: string, @GetUser() payload: JwtPayload) {
        return this.tasksService.getTask(id, payload.sub);
    }

    @Get()
    getTasks(@Body() filters: FilterTaskDto, @GetUser() payload: JwtPayload) {
        return this.tasksService.getTasks(payload.sub, filters)
    }

}
