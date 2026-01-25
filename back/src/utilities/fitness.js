import { checkNoOverlaps, checkTeacherPreferences, checkWeeklyHours, calculateWeeklyBalancePenalty, getSessionDurationMinutes } from "./helper.js";
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

    const normalizedTimeSlots = Array.isArray(timeSlots)
        ? timeSlots
            .filter((ts) => ts && typeof ts.start === "string" && typeof ts.end === "string")
            .map((ts) => ({ start: ts.start, end: ts.end }))
        : [];

    const timeSlotSet = normalizedTimeSlots.length > 0
        ? new Set(normalizedTimeSlots.map((ts) => `${ts.start}::${ts.end}`))
        : null;

    const allowedDurations = Array.isArray(allowedSessionDurationsMinutes) && allowedSessionDurationsMinutes.length > 0
        ? allowedSessionDurationsMinutes
            .map((d) => Number(d))
            .filter((d) => Number.isFinite(d) && d > 0)
        : null;

    // 0. Duration validity + time-slot alignment (Hard)
    for (let i = 0; i < sessions.length; i++) {
        const s = sessions[i];
        if (!s?.startTime || !s?.endTime) continue;

        if (timeSlotSet && !timeSlotSet.has(`${s.startTime}::${s.endTime}`)) {
            score -= hardConstraintPenalty;
        }

        const duration = getSessionDurationMinutes(s);
        if (typeof sessionLengthMinutes === "number" && Number.isFinite(sessionLengthMinutes)) {
            if (duration !== sessionLengthMinutes) {
                score -= hardConstraintPenalty;
            }
        } else if (allowedDurations) {
            if (!allowedDurations.includes(duration)) {
                score -= hardConstraintPenalty;
            }
        }
    }

    // 0. Back-to-back sessions check (Hard): require a minimum break
    const byDayEntity = new Map();
    const addBucket = (day, entityType, entityId, session) => {
        if (!day || !entityId || !session?.startTime || !session?.endTime) return;
        const key = `${day}::${entityType}::${entityId?.toString?.() ?? entityId}`;
        if (!byDayEntity.has(key)) byDayEntity.set(key, []);
        byDayEntity.get(key).push(session);
    };

    for (const s of sessions) {
        addBucket(s?.day, "teacher", s?.teacher, s);
        addBucket(s?.day, "group", s?.group, s);
    }

    const minBreak = Number.isFinite(Number(minBreakMinutes)) ? Number(minBreakMinutes) : 0;
    if (minBreak > 0) {
        for (const bucket of byDayEntity.values()) {
            bucket.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
            for (let i = 0; i < bucket.length - 1; i++) {
                const current = bucket[i];
                const next = bucket[i + 1];
                const gap = timeToMinutes(next.startTime) - timeToMinutes(current.endTime);
                if (gap < minBreak) {
                    score -= hardConstraintPenalty;
                }
            }
        }
    }

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