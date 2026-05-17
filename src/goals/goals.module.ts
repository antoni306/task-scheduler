import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { Goal, GoalSchema } from './schemas/Goal.schema';
import { WeeklyPlan, WeeklyPlanSchema } from './schemas/WeeklyPlan.schema';
import { WeeklyRecord, WeeklyRecordSchema } from './schemas/WeeklyRecord.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Goal.name, schema: GoalSchema },
      { name: WeeklyPlan.name, schema: WeeklyPlanSchema },
      { name: WeeklyRecord.name, schema: WeeklyRecordSchema },
    ]),
  ],
  controllers: [GoalsController],
  providers: [GoalsService],
})
export class GoalsModule {}
