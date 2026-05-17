import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Goal } from "./schemas/Goal.schema";
import { WeeklyPlan } from "./schemas/WeeklyPlan.schema";
import { WeeklyRecord } from "./schemas/WeeklyRecord.schema";
import {
    GoalDto,
    GoalResponse,
    WeeklyPlanResponse,
    WeeklyRecordResponse,
    StatsResponse,
} from "./schemas/types";

@Injectable()
export class GoalsService {
    constructor(
        @InjectModel(Goal.name) private goalModel: Model<Goal>,
        @InjectModel(WeeklyPlan.name) private weeklyPlanModel: Model<WeeklyPlan>,
        @InjectModel(WeeklyRecord.name) private weeklyRecordModel: Model<WeeklyRecord>,
    ) {}

    // ── Goal Library ───────────────────────────────────────────────────────────

    async createGoal(dto: GoalDto): Promise<GoalResponse> {
        const created = await this.goalModel.create(dto);
        return this.mapGoal(created.toObject());
    }

    async getGoals(userId: string): Promise<GoalResponse[]> {
        const goals = await this.goalModel.find({ userId }).exec();
        return goals.map((g) => this.mapGoal(g.toObject()));
    }

    async deleteGoal(id: string): Promise<void> {
        const goal = await this.goalModel.findById(id);
        if (!goal) return;

        await this.goalModel.deleteOne({ _id: id });

        // Remove from user's plan template
        const plan = await this.weeklyPlanModel.findOne({ userId: goal.userId });
        if (plan) {
            plan.days.forEach((d) => {
                d.goalIds = d.goalIds.filter(
                    (gid) => gid.toString() !== id,
                ) as any;
            });
            await plan.save();
        }
    }

    async renameCategory(userId: string, oldCategory: string, newCategory: string): Promise<void> {
        await this.goalModel.updateMany(
            { userId, category: oldCategory },
            { $set: { category: newCategory } },
        );
    }

    // ── Plan Template ──────────────────────────────────────────────────────────

    async getPlanTemplate(userId: string): Promise<WeeklyPlanResponse> {
        let plan = await this.weeklyPlanModel.findOne({ userId });
        if (!plan) {
            plan = await this.weeklyPlanModel.create({ userId, days: [] });
        }
        return this.populatePlan(plan.toObject());
    }

    async updatePlanTemplate(
        userId: string,
        days: { dayOfWeek: number; goalIds: string[] }[],
    ): Promise<WeeklyPlanResponse> {
        const mappedDays = days.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            goalIds: d.goalIds.map((id) => new Types.ObjectId(id)),
        }));

        const plan = await this.weeklyPlanModel.findOneAndUpdate(
            { userId },
            { $set: { days: mappedDays } },
            { new: true, upsert: true },
        );

        return this.populatePlan(plan.toObject());
    }

    // ── Current Week Record ────────────────────────────────────────────────────

    async getCurrentWeek(userId: string): Promise<WeeklyRecordResponse> {
        const weekStart = this.getMonday(new Date());

        let record = await this.weeklyRecordModel.findOne({ userId, weekStart });

        if (!record) {
            record = await this.createWeekRecord(userId, weekStart);
        } else {
            // If the record is empty, try to populate from plan (first-time setup)
            const totalEntries = record.days.reduce(
                (acc, d) => acc + d.entries.length,
                0,
            );
            if (totalEntries === 0) {
                const plan = await this.weeklyPlanModel.findOne({ userId });
                if (plan && plan.days.some((d) => d.goalIds.length > 0)) {
                    await this.weeklyRecordModel.deleteOne({ _id: record._id });
                    record = await this.createWeekRecord(userId, weekStart);
                }
            }
        }

        return this.mapWeeklyRecord(record.toObject());
    }

    async toggleEntry(
        userId: string,
        dayOfWeek: number,
        goalId: string,
    ): Promise<WeeklyRecordResponse> {
        const weekStart = this.getMonday(new Date());
        const record = await this.weeklyRecordModel.findOne({ userId, weekStart });
        if (!record) throw new NotFoundException("Brak rekordu tygodnia");

        const day = record.days.find((d) => d.dayOfWeek === dayOfWeek);
        if (!day) throw new NotFoundException("Brak dnia");

        const entry = day.entries.find((e) => e.goalId.toString() === goalId);
        if (!entry) throw new NotFoundException("Brak wpisu");

        entry.completed = !entry.completed;
        await record.save();

        return this.mapWeeklyRecord(record.toObject());
    }

    async updateNote(
        userId: string,
        dayOfWeek: number,
        goalId: string,
        note: string,
    ): Promise<WeeklyRecordResponse> {
        const weekStart = this.getMonday(new Date());
        const record = await this.weeklyRecordModel.findOne({ userId, weekStart });
        if (!record) throw new NotFoundException("Brak rekordu tygodnia");

        const day = record.days.find((d) => d.dayOfWeek === dayOfWeek);
        if (!day) throw new NotFoundException("Brak dnia");

        const entry = day.entries.find((e) => e.goalId.toString() === goalId);
        if (!entry) throw new NotFoundException("Brak wpisu");

        entry.note = note;
        await record.save();

        return this.mapWeeklyRecord(record.toObject());
    }

    // ── Statistics ─────────────────────────────────────────────────────────────

    async getStats(
        userId: string,
        from?: string,
        to?: string,
    ): Promise<StatsResponse> {
        const query: any = { userId };

        if (from || to) {
            query.weekStart = {};
            if (from) query.weekStart.$gte = new Date(from);
            if (to) query.weekStart.$lte = new Date(to);
        }

        const records = await this.weeklyRecordModel
            .find(query)
            .sort({ weekStart: 1 })
            .exec();

        return {
            weeks: records.map((r) => {
                const obj = r.toObject();
                return {
                    weekStart: obj.weekStart.toISOString(),
                    days: obj.days.map((d) => ({
                        dayOfWeek: d.dayOfWeek,
                        entries: d.entries.map((e) => ({
                            category: e.category,
                            completed: e.completed,
                        })),
                    })),
                };
            }),
        };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private getMonday(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay(); // 0=Niedz
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    private async createWeekRecord(userId: string, weekStart: Date) {
        const plan = await this.weeklyPlanModel.findOne({ userId });

        if (!plan || plan.days.length === 0) {
            return this.weeklyRecordModel.create({ userId, weekStart, days: [] });
        }

        const allGoalIds = plan.days.flatMap((d) => d.goalIds);
        const goals = await this.goalModel.find({ _id: { $in: allGoalIds } });
        const goalsMap = new Map(
            goals.map((g) => [g._id.toString(), g.toObject()]),
        );

        const days = plan.days
            .filter((d) => d.goalIds.length > 0)
            .map((d) => ({
                dayOfWeek: d.dayOfWeek,
                entries: d.goalIds
                    .map((gid) => goalsMap.get(gid.toString()))
                    .filter(Boolean)
                    .map((g: any) => ({
                        goalId: new Types.ObjectId(g._id.toString()),
                        name: g.name,
                        category: g.category,
                        description: g.description,
                        completed: false,
                    })),
            }));

        return this.weeklyRecordModel.create({ userId, weekStart, days });
    }

    private mapGoal(obj: any): GoalResponse {
        return {
            _id: obj._id.toString(),
            name: obj.name,
            category: obj.category,
            description: obj.description,
            userId: obj.userId,
        };
    }

    private async populatePlan(planObj: any): Promise<WeeklyPlanResponse> {
        const allGoalIds = planObj.days.flatMap((d: any) => d.goalIds);
        const goals = await this.goalModel.find({ _id: { $in: allGoalIds } });
        const goalsMap = new Map(
            goals.map((g) => [g._id.toString(), this.mapGoal(g.toObject())]),
        );

        return {
            userId: planObj.userId,
            days: planObj.days.map((d: any) => ({
                dayOfWeek: d.dayOfWeek,
                goalIds: d.goalIds.map((id: any) => id.toString()),
                goals: d.goalIds
                    .map((id: any) => goalsMap.get(id.toString()))
                    .filter(Boolean),
            })),
        };
    }

    private mapWeeklyRecord(obj: any): WeeklyRecordResponse {
        return {
            _id: obj._id.toString(),
            userId: obj.userId,
            weekStart: obj.weekStart.toISOString(),
            days: obj.days.map((d: any) => ({
                dayOfWeek: d.dayOfWeek,
                entries: d.entries.map((e: any) => ({
                    goalId: e.goalId.toString(),
                    name: e.name,
                    category: e.category,
                    description: e.description,
                    note: e.note,
                    completed: e.completed,
                })),
            })),
        };
    }
}
