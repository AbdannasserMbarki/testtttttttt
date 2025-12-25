import { checkNoOverlaps, checkTeacherPreferences, checkWeeklyHours, calculateWeeklyBalancePenalty } from "./helper.js";

export const calculateFitness = (sessions, rooms, options = {}) => {
    let score = 0;
    const hardConstraintPenalty = 1000;
    const softConstraintPenalty = 10;

    const {
        preferencesByTeacher = null,
        subjectsById = null,
        days = null
    } = options || {};

    // 1. Capacity Check (Hard) (only if data exists)
    for (let i = 0; i < sessions.length; i++) {
        const s = sessions[i];
        if (!s?.room) continue;

        const room = rooms.find(r => r?._id?.toString?.() === s.room?.toString?.());
        const groupSize = s?.groupSize;

        if (room && typeof groupSize === "number" && room.capacity < groupSize) {
            score -= hardConstraintPenalty;
        }
    }

    // 2. No Overlaps (Hard): teacher/group/room cannot overlap
    const conflicts = checkNoOverlaps(sessions);
    score -= conflicts.length * hardConstraintPenalty;

    // 3. Respect teacher preferences (Soft)
    if (preferencesByTeacher) {
        const prefViolations = checkTeacherPreferences(sessions, preferencesByTeacher);
        score -= prefViolations.length * softConstraintPenalty;
    }

    // 4. Required hours per week per (group, subject) (Hard)
    if (subjectsById) {
        const weeklyHourIssues = checkWeeklyHours(sessions, subjectsById);
        score -= weeklyHourIssues.length * hardConstraintPenalty;
    }

    // 5. Balance across the week (Soft): spread sessions regularly
    const balancePenalty = calculateWeeklyBalancePenalty(sessions, "group", days);
    score -= balancePenalty * softConstraintPenalty;

    return score;
};