import { IsDateString, IsEnum, IsString } from "class-validator";
import { TaskStatus } from "../task-status.enum";

export class CreateTaskDto {
    @IsString()
    title: string;
    @IsString()
    description: string;
    @IsDateString()
    dueDate: Date;
}