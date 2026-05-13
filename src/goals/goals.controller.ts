import { Body, Controller, Post,Get, Param, Delete } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { Goal } from './schemas/Goal.schema';
import { ObjectId } from 'typeorm';
@Controller('goals')
export class GoalsController {
    constructor(private GoalsService:GoalsService){}
    @Post()
    create(@Body() goalDto:any): Promise<Goal & {_id: string;}> {
        return this.GoalsService.create(goalDto);
    }
    @Get(":userId")
    getAll(@Param("userId") id:string ): Promise<(Goal & {_id: string})[]>{
        return this.GoalsService.findAll(id);
    }
    @Delete(":id")
    deleteGoal(@Param("id") id){
        return this.GoalsService.deleteGoal(id);
    }

    @Delete(":userId/all")
    deleteAll(@Param("userId") userId:string){
        return this.GoalsService.deleteAll(userId);
    }
}
