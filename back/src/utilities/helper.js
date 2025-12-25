import { isTimeOverlapping, timeToMinutes } from "./time.js";

const DAYS = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
const HOURS = [ "8:15", "10:00", "11:45", "15:00", "16:45" ];

// Check if the given hour is in the morning or afternoon
const isMorning = (hour) => {
  return timeToMinutes(hour) < timeToMinutes("13:15") ? "morning" : "any";
}

const isEvening = (hour) => {
  return timeToMinutes(hour) > timeToMinutes("13:15") ? "evening" : "any";
}

// Check if the given day is in the teacher's unavailable days
const isUnavailableDay = (day, teacherId, preferencesByTeacher = {}) => {
  const preference = preferencesByTeacher?.[teacherId?.toString?.() ?? teacherId];
  if (!preference) return false;
  return Array.isArray(preference.unavailableDays) && preference.unavailableDays.includes(day);
}

// Check if the given day matches the teacher's day preference
const isDayPreference = (day, teacherId, preferencesByTeacher = {}) => {
  const preference = preferencesByTeacher?.[teacherId?.toString?.() ?? teacherId];
  if (!preference) return true;
  if (!Array.isArray(preference.timePreferences) || preference.timePreferences.length === 0) return true;
  return preference.timePreferences.some((tp) => tp?.day === day);
}

// Check if the given hour matches the teacher's time preference
const isTimePreference = (hour, teacherId, preferencesByTeacher = {}, day = null) => {
  const preference = preferencesByTeacher?.[teacherId?.toString?.() ?? teacherId];
  if (!preference) return true;
  if (!Array.isArray(preference.timePreferences) || preference.timePreferences.length === 0) return true;

  const relevant = day
    ? preference.timePreferences.filter((tp) => tp?.day === day)
    : preference.timePreferences;

  if (relevant.length === 0) return true;

  return relevant.some((tp) => {
    if (!tp?.slot || tp.slot === "any") return true;
    if (tp.slot === "morning") return isMorning(hour) === "morning";
    if (tp.slot === "evening") return isEvening(hour) === "evening";
    return true;
  });
}

const getSessionDurationMinutes = (session) => {
  if (!session?.startTime || !session?.endTime) return 0;
  return Math.max(0, timeToMinutes(session.endTime) - timeToMinutes(session.startTime));
};

const checkNoOverlaps = (sessions = []) => {
  const conflicts = [];

  for (let i = 0; i < sessions.length; i++) {
    const s1 = sessions[i];

    for (let j = i + 1; j < sessions.length; j++) {
      const s2 = sessions[j];

      if (!isTimeOverlapping(s1, s2)) continue;

      if (s1.teacher && s2.teacher && s1.teacher.toString() === s2.teacher.toString()) {
        conflicts.push({ type: "teacher", id: s1.teacher, s1, s2 });
      }
      if (s1.group && s2.group && s1.group.toString() === s2.group.toString()) {
        conflicts.push({ type: "group", id: s1.group, s1, s2 });
      }
      if (s1.room && s2.room && s1.room.toString() === s2.room.toString()) {
        conflicts.push({ type: "room", id: s1.room, s1, s2 });
      }
    }
  }

  return conflicts;
};

const checkTeacherPreferences = (sessions = [], preferencesByTeacher = {}) => {
  const violations = [];

  for (const s of sessions) {
    if (!s?.teacher || !s?.day || !s?.startTime) continue;

    const teacherKey = s.teacher.toString();

    if (isUnavailableDay(s.day, teacherKey, preferencesByTeacher)) {
      violations.push({ type: "unavailable_day", teacher: s.teacher, session: s });
      continue;
    }

    if (!isTimePreference(s.startTime, teacherKey, preferencesByTeacher, s.day)) {
      violations.push({ type: "time_preference", teacher: s.teacher, session: s });
    }
  }

  return violations;
};

const checkWeeklyHours = (sessions = [], subjectsById = {}) => {
  const requiredByGroupSubject = new Map();
  const actualByGroupSubject = new Map();

  const toKey = (groupId, subjectId) => `${groupId?.toString?.() ?? groupId}::${subjectId?.toString?.() ?? subjectId}`;

  for (const s of sessions) {
    if (!s?.group || !s?.subject) continue;
    const subject = subjectsById?.[s.subject?.toString?.() ?? s.subject];
    if (!subject || subject.houresparweek === undefined || subject.houresparweek === null) continue;

    const key = toKey(s.group, s.subject);
    const requiredMinutes = Math.round(Number(subject.houresparweek) * 60);
    requiredByGroupSubject.set(key, requiredMinutes);

    const prev = actualByGroupSubject.get(key) ?? 0;
    actualByGroupSubject.set(key, prev + getSessionDurationMinutes(s));
  }

  const issues = [];
  for (const [key, requiredMinutes] of requiredByGroupSubject.entries()) {
    const actualMinutes = actualByGroupSubject.get(key) ?? 0;
    if (actualMinutes !== requiredMinutes) {
      issues.push({ key, requiredMinutes, actualMinutes });
    }
  }

  return issues;
};

const checkWeeklySessionCounts = (sessions = [], subjectsById = {}, options = {}) => {
  const { allowedSessionDurationsMinutes = null } = options || {};
  if (!Array.isArray(allowedSessionDurationsMinutes) || allowedSessionDurationsMinutes.length === 0) return [];

  const byGroupSubject = new Map();
  const toKey = (groupId, subjectId) => `${groupId?.toString?.() ?? groupId}::${subjectId?.toString?.() ?? subjectId}`;

  for (const s of sessions) {
    if (!s?.group || !s?.subject) continue;
    const key = toKey(s.group, s.subject);
    if (!byGroupSubject.has(key)) byGroupSubject.set(key, []);
    byGroupSubject.get(key).push(s);
  }

  const issues = [];
  for (const [key, groupSessions] of byGroupSubject.entries()) {
    const subjectId = key.split("::")[1];
    const subject = subjectsById?.[subjectId];
    if (!subject || subject.houresparweek === undefined || subject.houresparweek === null) continue;

    const requiredMinutes = Math.round(Number(subject.houresparweek) * 60);
    const durations = groupSessions.map(getSessionDurationMinutes);
    const invalidDurations = durations.filter((d) => !allowedSessionDurationsMinutes.includes(d));

    if (invalidDurations.length > 0) {
      issues.push({ key, type: "invalid_duration", requiredMinutes, durations });
      continue;
    }

    const count = durations.length;
    const validCounts = allowedSessionDurationsMinutes
      .filter((d) => d > 0)
      .filter((d) => requiredMinutes % d === 0)
      .map((d) => requiredMinutes / d);

    if (validCounts.length > 0 && !validCounts.includes(count)) {
      issues.push({ key, type: "invalid_count", requiredMinutes, count, validCounts, durations });
    }
  }

  return issues;
};

const calculateWeeklyBalancePenalty = (sessions = [], entity = "group", days = null) => {
  const buckets = new Map();

  for (const s of sessions) {
    const entityId = s?.[entity];
    if (!entityId || !s?.day) continue;

    const key = entityId.toString();
    if (!buckets.has(key)) buckets.set(key, new Map());
    const dayMap = buckets.get(key);
    dayMap.set(s.day, (dayMap.get(s.day) ?? 0) + 1);
  }

  const activeDays = Array.isArray(days) && days.length > 0
    ? days
    : Array.from(new Set(sessions.map((s) => s?.day).filter(Boolean)));

  const consideredDays = activeDays.length > 0 ? activeDays : DAYS;

  let penalty = 0;
  for (const dayMap of buckets.values()) {
    const counts = consideredDays.map((d) => dayMap.get(d) ?? 0);
    const total = counts.reduce((a, b) => a + b, 0);
    if (total === 0) continue;

    const mean = total / consideredDays.length;
    const variance = counts.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) / consideredDays.length;
    penalty += variance;
  }

  return penalty;
};

export {
  DAYS,
  HOURS,
  isMorning,
  isEvening,
  isUnavailableDay,
  isDayPreference,
  isTimePreference,
  getSessionDurationMinutes,
  checkNoOverlaps,
  checkTeacherPreferences,
  checkWeeklyHours,
  checkWeeklySessionCounts,
  calculateWeeklyBalancePenalty
};