import { checkNoOverlaps, checkTeacherPreferences, checkWeeklyHours, calculateWeeklyBalancePenalty, countTimeSlotAlignmentViolations, countSessionDurationViolations, countBackToBackViolations } from "./helper.js";
import { timeToMinutes } from "./time.js";


//needs to be implmented:
//      session length check  (toMin(end) - toMin(start) == sessionLengthMinutes)
//      back to back sessions check
//      time slot alignment check (start = 10:00, end = 8:15 not allowed)
//      


export const calculateFitness = (sessions, rooms, options = {}) => {
    let score = 0;
    const hardConstraintPenalty = 1000;
    const softConstraintPenalty = 1000;


    const {
        preferencesByTeacher = null,
        subjectsById = null,
        days = null,
        timeSlots = null,
        sessionLengthMinutes = null,
        allowedSessionDurationsMinutes = null,
        minBreakMinutes = 15
    } = options || {};

    // 0. Duration validity + time-slot alignment + back-to-back checks (Hard)
    const timeSlotAlignmentViolations = countTimeSlotAlignmentViolations(sessions, timeSlots);
    score -= timeSlotAlignmentViolations * hardConstraintPenalty;

    const durationViolations = countSessionDurationViolations(sessions, { sessionLengthMinutes, allowedSessionDurationsMinutes });
    score -= durationViolations * hardConstraintPenalty;

    const backToBackViolations = countBackToBackViolations(sessions, { minBreakMinutes });
    score -= backToBackViolations * hardConstraintPenalty;

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