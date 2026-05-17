import { Body, Controller, Post, Get, Param, Delete, Patch, Query } from "@nestjs/common";
import { GoalsService } from "./goals.service";

@Controller("goals")
export class GoalsController {
    constructor(private goalsService: GoalsService) {}

    // Goal library
    @Post()
    createGoal(@Body() dto: any) {
        return this.goalsService.createGoal(dto);
    }

    @Get("user/:userId")
    getGoals(@Param("userId") userId: string) {
        return this.goalsService.getGoals(userId);
    }

    @Delete(":id")
    deleteGoal(@Param("id") id: string) {
        return this.goalsService.deleteGoal(id);
    }

    // Plan template
    @Get("plan/:userId")
    getPlanTemplate(@Param("userId") userId: string) {
        return this.goalsService.getPlanTemplate(userId);
    }

    @Patch("plan/:userId")
    updatePlanTemplate(
        @Param("userId") userId: string,
        @Body() body: { days: { dayOfWeek: number; goalIds: string[] }[] },
    ) {
        return this.goalsService.updatePlanTemplate(userId, body.days);
    }

    // Current week record
    @Get("week/current/:userId")
    getCurrentWeek(@Param("userId") userId: string) {
        return this.goalsService.getCurrentWeek(userId);
    }

    @Patch("week/current/:userId/day/:day/entry/:goalId/toggle")
    toggleEntry(
        @Param("userId") userId: string,
        @Param("day") day: string,
        @Param("goalId") goalId: string,
    ) {
        return this.goalsService.toggleEntry(userId, parseInt(day), goalId);
    }

    @Patch("week/current/:userId/day/:day/entry/:goalId/note")
    updateNote(
        @Param("userId") userId: string,
        @Param("day") day: string,
        @Param("goalId") goalId: string,
        @Body() body: { note: string },
    ) {
        return this.goalsService.updateNote(userId, parseInt(day), goalId, body.note);
    }

    // Category rename
    @Patch("category/:userId")
    renameCategory(
        @Param("userId") userId: string,
        @Body() body: { oldCategory: string; newCategory: string },
    ) {
        return this.goalsService.renameCategory(userId, body.oldCategory, body.newCategory);
    }

    // Statistics
    @Get("stats/:userId")
    getStats(
        @Param("userId") userId: string,
        @Query("from") from?: string,
        @Query("to") to?: string,
    ) {
        return this.goalsService.getStats(userId, from, to);
    }
}
