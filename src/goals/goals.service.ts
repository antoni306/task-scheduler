import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Goal } from "./schemas/Goal.schema";
import { Model } from "mongoose";
import { v4 as uuid } from "uuid";
@Injectable()
export class GoalsService {
    
    constructor(@InjectModel(Goal.name) private goalModel:Model<Goal>){
    }
    async  create(createGoalDto: any): Promise<Goal & {_id:string}> {
        const createdGoal = new this.goalModel(createGoalDto);

        createGoalDto._id=uuid();
        const saved= await createdGoal.save();
        return {
            _id:saved._id.toHexString(),
            name:saved.name,
            category:saved.category,
            description:saved.description,
            userId:saved.userId,
        };
    }
    async findAll(userId:string): Promise<(Goal & {_id:string})[]> {
        const goals = await this.goalModel.find({userId}).exec();
        
        return goals.map(g=>{
            const obj = g.toObject()
            return {
                _id:obj._id.toString(),
                name:obj.name,
                category:obj.category,
                description:obj.description,
                userId:obj.userId,
            }
        });
    }

    async deleteGoal(id){
        return this.goalModel.deleteOne({_id:id});
    }

    async deleteAll(userId: string) {
        return this.goalModel.deleteMany({userId}).exec();
    }
    
}