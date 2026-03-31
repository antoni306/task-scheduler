import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "../task-status.enum";
export class FilterTaskDto {
    @IsOptional()
    @IsString()
    title: string;
    @IsOptional()
    @IsString()
    description: string;
    @IsOptional()
    @IsDateString()
    dueDate: Date;
    @IsOptional()
    @IsEnum(TaskStatus)
    taskStatus: TaskStatus;
}