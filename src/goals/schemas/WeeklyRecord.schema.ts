import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";

export type WeeklyRecordDocument = HydratedDocument<WeeklyRecord>;

@Schema({ _id: false })
export class EntryRecord {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Goal", required: true })
    goalId!: Types.ObjectId;

    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    category!: string;

    @Prop()
    description?: string;

    @Prop()
    note?: string;

    @Prop({ default: false })
    completed!: boolean;
}

export const EntryRecordSchema = SchemaFactory.createForClass(EntryRecord);

@Schema({ _id: false })
export class DayRecord {
    @Prop({ required: true })
    dayOfWeek!: number; // 0=Pon, 1=Wt, ..., 6=Niedz

    @Prop({ type: [EntryRecordSchema], default: [] })
    entries!: EntryRecord[];
}

export const DayRecordSchema = SchemaFactory.createForClass(DayRecord);

@Schema()
export class WeeklyRecord {
    @Prop({ required: true })
    userId!: string;

    @Prop({ required: true })
    weekStart!: Date;

    @Prop({ type: [DayRecordSchema], default: [] })
    days!: DayRecord[];
}

export const WeeklyRecordSchema = SchemaFactory.createForClass(WeeklyRecord);
