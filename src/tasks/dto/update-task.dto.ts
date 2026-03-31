import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "../task-status.enum";


export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    title: string;
    @IsOptional()
    @IsString()
    description: string
    @IsOptional()
    @IsDateString()
    dueDate: string
    @IsOptional()
    @IsEnum(TaskStatus)
    taskStatus: TaskStatus
}