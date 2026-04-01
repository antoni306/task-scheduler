import { Controller, UseGuards, Post, Body, Param, Get, Patch, Delete, Req } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { FilterTaskDto } from './dto/filter-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from '@nestjs/common';
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Post()
    createTask(@Body() createTaskDto: CreateTaskDto, @Request() req): Promise<Task> {
        const { title, description, dueDate } = createTaskDto;
        return this.tasksService.createTask(title, description, dueDate, req.user.sub);
    }


    @Get(':id')
    getTask(@Param('id') id: string, @Request() req) {
        return this.tasksService.getTask(id, req.user.sub);
    }

    @Get()
    getTasks(@Body() filters: FilterTaskDto, @Request() req) {
        return this.tasksService.getTasks(req.user.sub, filters)
    }

    @Patch(':id')
    updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
        return this.tasksService.updateTask(id, updateTaskDto, req.user.sub);
    }

    @Delete(':id')
    deleteTask(@Param('id') id: string, @Request() req) {
        return this.tasksService.deleteTask(id, req.user.sub);
    }




}
