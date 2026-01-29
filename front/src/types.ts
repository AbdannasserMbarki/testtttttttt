export const DayOfWeek = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday'
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const SessionType = {
  LECTURE: 'Lecture',
  TUTORIAL: 'Tutorial', // TD
  LAB: 'Lab', // TP
  SEMINAR: 'Seminar'
} as const;

export type SessionType = (typeof SessionType)[keyof typeof SessionType];

export interface Teacher {
  id: string;
  name: string;
  department: string;
  email: string;
  avatarUrl: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  type: 'Lab' | 'Lecture Hall' | 'Classroom';
}

export interface StudentGroup {
  id: string;
  name: string; // e.g., "DSI-2-A"
  speciality: string; // e.g., "DSI"
  year: number; // 1, 2, 3
  studentCount: number;
}

export interface Session {
  id: string;
  subject: string;
  teacherId: string;
  roomId: string;
  groupId: string;
  day: DayOfWeek;
  startTime: string; // "08:00"
  endTime: string; // "10:00"
  type: SessionType;
  color?: string; // Hex code for UI
}

export interface TimetableData {
  meta: {
    institutionName: string;
    academicYear: string;
    isPublished: boolean;
    lastUpdated: string;
  };
  teachers: Teacher[];
  rooms: Room[];
  groups: StudentGroup[];
  sessions: Session[];
}

export type ViewMode = 'dashboard' | 'overview' | 'teachers' | 'groups' | 'rooms' | 'my-portal';

// Preference Types
export type PreferenceSlot = 'morning' | 'evening' | 'any';

export interface TimePreference {
  day: DayOfWeek;
  slot: PreferenceSlot;
}

export interface TeacherPreference {
  teacherId: string;
  timePreferences: TimePreference[];
}

// Auth Types
export type UserRole = 'admin' | 'teacher';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}
