import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { GetUser } from 'src/auth/get-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';
@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Post()
    createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() payload: JwtPayload) {
        const { title, description, dueDate } = createTaskDto;
        return this.tasksService.createTask(title, description, dueDate, payload.sub);
    }

}
