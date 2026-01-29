import type { TimePreference } from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

const API_BASE_URL: string = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL
  ?? DEFAULT_API_BASE_URL;

class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const safeJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  const body = await safeJson(res);
  if (!res.ok) {
    const message = typeof (body as any)?.message === 'string' ? (body as any).message : `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  return body as T;
};

export type BackendAuthUser = {
  id: string;
  username: string;
  email: string;
  isadmin: boolean;
};

export type BackendAuthResponse = {
  message: string;
  user: BackendAuthUser;
};

export type BackendUser = {
  _id: string;
  username: string;
  email: string;
  isadmin: boolean;
};

export type BackendUsersResponse = {
  message: string;
  users: BackendUser[];
};

export type BackendRoom = {
  _id: string;
  roomId: string;
  capacity: number;
  equipment?: string[];
};

export type BackendRoomsResponse = {
  message: string;
  rooms: BackendRoom[];
};

export type BackendGroupe = {
  _id: string;
  speciality: string;
  size: number;
  yearOfStudy: number;
};

export type BackendGroupesResponse = {
  message: string;
  groupes: BackendGroupe[];
};

export type BackendTimetableEntry = {
  subject?: { _id: string; subjectname?: string; code?: string } | string;
  teacher?: { _id: string; username?: string; email?: string; isadmin?: boolean } | string;
  group?: { _id: string; speciality?: string; size?: number; yearOfStudy?: number } | string;
  room?: { _id: string; roomId?: string; capacity?: number; equipment?: string[] } | string;
  day: string;
  startTime: string;
  endTime: string;
};

export type BackendTimetable = {
  _id: string;
  name: string;
  academicYear?: string;
  semester: number;
  isPublished: boolean;
  entries: BackendTimetableEntry[];
  generationConfig?: {
    days?: string[];
    timeSlots?: Array<{ start: string; end: string }>;
    allowedSessionDurationsMinutes?: number[];
  };
  fitnessScore?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendTimetablesResponse = {
  message: string;
  timetables: BackendTimetable[];
};

export type BackendTimetableByIdResponse = {
  message: string;
  timetable: BackendTimetable;
};

export type BackendUpdateTimetableRequest = {
  name?: string;
  academicYear?: string;
  semester?: number;
  createdBy?: string;
  isPublished?: boolean;
  entries?: BackendTimetableEntry[];
};

export type BackendUpdateTimetableResponse = {
  message: string;
  timetable: BackendTimetable;
};

export type BackendGenerateTimetableRequest = {
  name: string;
  academicYear?: string;
  semester: number;
  createdBy?: string;
  days?: string[];
  timeSlots?: Array<{ start: string; end: string }>;
  allowedSessionDurationsMinutes?: number[];
  sessions?: unknown[];
};

export type BackendGenerateTimetableResponse = {
  message: string;
  timetable: BackendTimetable;
};

export type BackendPreference = {
  _id: string;
  teacher: string | { _id: string; username?: string; email?: string };
  timePreferences: Array<{ day: string; slot: 'morning' | 'evening' | 'any' }>;
};

export type BackendPreferenceResponse = {
  message: string;
  preference: BackendPreference;
};

export type BackendPreferencesResponse = {
  message: string;
  preferences: BackendPreference[];
};

export type BackendSubject = {
  _id: string;
  subjectname: string;
  code: string;
  houresparweek: number;
  type?: string;
  totalHours?: number;
};

export type BackendSubjectsResponse = {
  message: string;
  subjects: BackendSubject[];
};

export type BackendSession = {
  _id: string;
  subject: unknown;
  teacher: unknown;
  group: unknown;
  room?: unknown;
  day?: string;
  startTime?: string;
  endTime?: string;
};

export type BackendSessionsResponse = {
  message: string;
  sessions: BackendSession[];
};

export const api = {
  baseUrl: API_BASE_URL,

  login: (email: string, password: string) => {
    return requestJson<BackendAuthResponse>('/users/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getUsers: () => requestJson<BackendUsersResponse>('/users'),
  createUser: (payload: { username: string; email: string; password: string; isadmin?: boolean }) => requestJson<{ message: string; user: BackendAuthUser }>('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateUserById: (id: string, payload: { username?: string; email?: string; password?: string; isadmin?: boolean }) => requestJson<{ message: string; user: BackendAuthUser }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteUserById: (id: string) => requestJson<{ message: string }>(`/users/${id}`, {
    method: 'DELETE'
  }),

  getRooms: () => requestJson<BackendRoomsResponse>('/rooms'),
  createRoom: (payload: { roomId: string; capacity: number; equipment?: string[]; type?: string }) => requestJson<{ message: string; room: unknown }>('/rooms/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateRoomById: (id: string, payload: { roomId?: string; capacity?: number; equipment?: string[]; type?: string }) => requestJson<{ message: string; room: unknown }>(`/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteRoomById: (id: string) => requestJson<{ message: string }>(`/rooms/${id}`, {
    method: 'DELETE'
  }),

  getGroupes: () => requestJson<BackendGroupesResponse>('/groupes'),
  createGroupe: (payload: { speciality: string; size: number; yearOfStudy: number }) => requestJson<{ message: string; groupe: unknown }>('/groupes/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateGroupeById: (id: string, payload: { speciality?: string; size?: number; yearOfStudy?: number }) => requestJson<{ message: string; groupe: unknown }>(`/groupes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteGroupeById: (id: string) => requestJson<{ message: string }>(`/groupes/${id}`, {
    method: 'DELETE'
  }),

  getSubjects: () => requestJson<BackendSubjectsResponse>('/subjects'),
  createSubject: (payload: { subjectname: string; code: string; houresparweek: number; type?: string; totalHours?: number }) => requestJson<{ message: string; subject: unknown }>('/subjects/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateSubjectById: (id: string, payload: { subjectname?: string; code?: string; houresparweek?: number; type?: string; totalHours?: number }) => requestJson<{ message: string; subject: unknown }>(`/subjects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteSubjectById: (id: string) => requestJson<{ message: string }>(`/subjects/${id}`, {
    method: 'DELETE'
  }),

  getSessions: () => requestJson<BackendSessionsResponse>('/sessions'),
  createSession: (payload: { subject: string; teacher: string; group: string; room?: string }) => requestJson<{ message: string; session: unknown }>('/sessions/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateSessionById: (id: string, payload: Record<string, unknown>) => requestJson<{ message: string; session: unknown }>(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteSessionById: (id: string) => requestJson<{ message: string }>(`/sessions/${id}`, {
    method: 'DELETE'
  }),

  getTimetables: () => requestJson<BackendTimetablesResponse>('/timetables'),
  getTimetableById: (id: string) => requestJson<BackendTimetableByIdResponse>(`/timetables/${id}`),

  createTimetable: (payload: { name: string; academicYear?: string; semester: number; createdBy?: string; isPublished?: boolean }) => requestJson<{ message: string; timetable: BackendTimetable }>('/timetables/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  updateTimetableById: (id: string, payload: BackendUpdateTimetableRequest) => requestJson<BackendUpdateTimetableResponse>(`/timetables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  deleteTimetableById: (id: string) => requestJson<{ message: string }>(`/timetables/${id}`, {
    method: 'DELETE'
  }),

  generateTimetable: (payload: BackendGenerateTimetableRequest) => requestJson<BackendGenerateTimetableResponse>('/timetables/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getPreferenceByTeacher: (teacherId: string) => requestJson<BackendPreferenceResponse>(`/preferences/${teacherId}`),
  getPreferences: () => requestJson<BackendPreferencesResponse>('/preferences'),

  createPreference: (payload: { teacher: string; unavailableDays?: string[]; timePreferences?: Array<{ day: string; slot: 'morning' | 'evening' | 'any' }>; maxHoursPerDay?: number; maxHoursPerWeek?: number }) => requestJson<BackendPreferenceResponse>('/preferences/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  updatePreferenceByTeacher: (teacherId: string, payload: { unavailableDays?: string[]; timePreferences?: Array<{ day: string; slot: 'morning' | 'evening' | 'any' }>; maxHoursPerDay?: number; maxHoursPerWeek?: number }) => requestJson<BackendPreferenceResponse>(`/preferences/${teacherId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),

  deletePreferenceByTeacher: (teacherId: string) => requestJson<{ message: string }>(`/preferences/${teacherId}`, {
    method: 'DELETE'
  }),

  upsertPreferenceByTeacher: async (teacherId: string, timePreferences: TimePreference[]) => {
    try {
      return await requestJson<BackendPreferenceResponse>(`/preferences/${teacherId}`, {
        method: 'PUT',
        body: JSON.stringify({ timePreferences })
      });
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return await requestJson<BackendPreferenceResponse>('/preferences/create', {
          method: 'POST',
          body: JSON.stringify({ teacher: teacherId, timePreferences })
        });
      }
      throw e;
    }
  }
};

export { ApiError };
