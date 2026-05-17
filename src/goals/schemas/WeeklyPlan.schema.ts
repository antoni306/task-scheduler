import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type WeeklyPlanDocument = HydratedDocument<WeeklyPlan>;

@Schema({ _id: false })
export class DayPlan {
    @Prop({ required: true })
    dayOfWeek!: number; // 0=Pon, 1=Wt, ..., 6=Niedz

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: "Goal" }], default: [] })
    goalIds!: Types.ObjectId[];
}

export const DayPlanSchema = SchemaFactory.createForClass(DayPlan);

@Schema()
export class WeeklyPlan {
    @Prop({ required: true, unique: true })
    userId!: string;

    @Prop({ type: [DayPlanSchema], default: [] })
    days!: DayPlan[];
}

export const WeeklyPlanSchema = SchemaFactory.createForClass(WeeklyPlan);
