import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type GoalDocument = HydratedDocument<Goal>;

@Schema()
export class Goal {
    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    category!: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    userId!: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
