export interface GoalDto {
    name: string;
    category: string;
    description?: string;
    userId: string;
}

export interface GoalResponse {
    _id: string;
    name: string;
    category: string;
    description?: string;
    userId: string;
}

export interface EntryRecordResponse {
    goalId: string;
    name: string;
    category: string;
    description?: string;
    note?: string;
    completed: boolean;
}

export interface DayRecordResponse {
    dayOfWeek: number;
    entries: EntryRecordResponse[];
}

export interface WeeklyRecordResponse {
    _id: string;
    userId: string;
    weekStart: string;
    days: DayRecordResponse[];
}

export interface DayPlanResponse {
    dayOfWeek: number;
    goalIds: string[];
    goals: GoalResponse[];
}

export interface WeeklyPlanResponse {
    userId: string;
    days: DayPlanResponse[];
}

export interface EntryStatRecord {
    category: string;
    completed: boolean;
}

export interface DayStatRecord {
    dayOfWeek: number;
    entries: EntryStatRecord[];
}

export interface WeekStatRecord {
    weekStart: string;
    days: DayStatRecord[];
}

export interface StatsResponse {
    weeks: WeekStatRecord[];
}
