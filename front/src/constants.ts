import type { TimetableData } from './types';
import { DayOfWeek, SessionType } from './types';

export const INITIAL_DATA: TimetableData = {
  meta: {
    institutionName: "Tech University of Science",
    academicYear: "2023-2024",
    isPublished: true, // Toggle this to see Draft badge
    lastUpdated: "2023-10-27T10:00:00Z"
  },
  teachers: [
    { id: 'admin', name: 'System Administrator', department: 'IT Services', email: 'admin@university.edu', avatarUrl: 'https://ui-avatars.com/api/?name=System+Admin&background=0f172a&color=fff' },
    { id: 't1', name: 'Dr. Sarah Connor', department: 'Computer Science', email: 's.connor@tus.edu', avatarUrl: 'https://picsum.photos/100/100?random=1' },
    { id: 't2', name: 'Prof. Alan Grant', department: 'Paleontology', email: 'a.grant@tus.edu', avatarUrl: 'https://picsum.photos/100/100?random=2' },
    { id: 't3', name: 'Ms. Ellen Ripley', department: 'Engineering', email: 'e.ripley@tus.edu', avatarUrl: 'https://picsum.photos/100/100?random=3' },
    { id: 't4', name: 'Mr. Tony Stark', department: 'Robotics', email: 't.stark@tus.edu', avatarUrl: 'https://picsum.photos/100/100?random=4' },
    { id: 't5', name: 'Dr. Indiana Jones', department: 'History', email: 'i.jones@tus.edu', avatarUrl: 'https://picsum.photos/100/100?random=5' }
  ],
  rooms: [
    { id: 'r1', name: 'Lab A101', capacity: 30, type: 'Lab', equipment: ['20 PCs', 'Projector', 'Whiteboard'] },
    { id: 'r2', name: 'Hall B200', capacity: 150, type: 'Lecture Hall', equipment: ['Projector', 'Mic System', 'Tiered Seating'] },
    { id: 'r3', name: 'Room C12', capacity: 40, type: 'Classroom', equipment: ['Whiteboard', 'TV Screen'] },
    { id: 'r4', name: 'Innovation Hub', capacity: 25, type: 'Lab', equipment: ['3D Printers', 'VR Sets', 'Whiteboard'] }
  ],
  groups: [
    { id: 'g1', name: 'DSI-1', speciality: 'Data Science', year: 1, studentCount: 28 },
    { id: 'g2', name: 'DSI-2', speciality: 'Data Science', year: 2, studentCount: 24 },
    { id: 'g3', name: 'RSI-1', speciality: 'Networks', year: 1, studentCount: 30 },
    { id: 'g4', name: 'SEM-3', speciality: 'Embedded Systems', year: 3, studentCount: 15 }
  ],
  sessions: [
    // Admin Session
    { id: 's_admin_1', subject: 'System Security', teacherId: 'admin', roomId: 'r1', groupId: 'g3', day: DayOfWeek.WEDNESDAY, startTime: '14:00', endTime: '16:00', type: SessionType.LECTURE, color: '#1e293b' },

    // Monday
    { id: 's1', subject: 'Intro to Algorithms', teacherId: 't1', roomId: 'r2', groupId: 'g1', day: DayOfWeek.MONDAY, startTime: '08:30', endTime: '10:00', type: SessionType.LECTURE, color: '#3b82f6' },
    { id: 's2', subject: 'Network Basics', teacherId: 't3', roomId: 'r3', groupId: 'g3', day: DayOfWeek.MONDAY, startTime: '08:30', endTime: '11:30', type: SessionType.LAB, color: '#10b981' },
    { id: 's3', subject: 'Advanced DB', teacherId: 't1', roomId: 'r1', groupId: 'g2', day: DayOfWeek.MONDAY, startTime: '10:30', endTime: '12:30', type: SessionType.TUTORIAL, color: '#f59e0b' },
    
    // Tuesday
    { id: 's4', subject: 'Robotics 101', teacherId: 't4', roomId: 'r4', groupId: 'g4', day: DayOfWeek.TUESDAY, startTime: '09:00', endTime: '12:00', type: SessionType.LAB, color: '#8b5cf6' },
    { id: 's5', subject: 'History of Tech', teacherId: 't5', roomId: 'r2', groupId: 'g1', day: DayOfWeek.TUESDAY, startTime: '14:00', endTime: '15:30', type: SessionType.LECTURE, color: '#ef4444' },

    // Wednesday
    { id: 's6', subject: 'Data Mining', teacherId: 't1', roomId: 'r1', groupId: 'g2', day: DayOfWeek.WEDNESDAY, startTime: '08:30', endTime: '11:30', type: SessionType.LAB, color: '#3b82f6' },
    { id: 's7', subject: 'Circuit Design', teacherId: 't3', roomId: 'r4', groupId: 'g4', day: DayOfWeek.WEDNESDAY, startTime: '13:00', endTime: '16:00', type: SessionType.LAB, color: '#10b981' },

    // Thursday
    { id: 's8', subject: 'Calculus II', teacherId: 't2', roomId: 'r2', groupId: 'g1', day: DayOfWeek.THURSDAY, startTime: '10:00', endTime: '12:00', type: SessionType.TUTORIAL, color: '#f59e0b' },
    { id: 's9', subject: 'Cloud Computing', teacherId: 't3', roomId: 'r1', groupId: 'g2', day: DayOfWeek.THURSDAY, startTime: '14:00', endTime: '17:00', type: SessionType.LAB, color: '#8b5cf6' },

    // Friday
    { id: 's10', subject: 'Project Management', teacherId: 't5', roomId: 'r3', groupId: 'g4', day: DayOfWeek.FRIDAY, startTime: '09:00', endTime: '10:30', type: SessionType.SEMINAR, color: '#ec4899' },
    { id: 's11', subject: 'AI Ethics', teacherId: 't1', roomId: 'r2', groupId: 'g2', day: DayOfWeek.FRIDAY, startTime: '11:00', endTime: '12:30', type: SessionType.LECTURE, color: '#3b82f6' },
    { id: 's12', subject: 'Networking Security', teacherId: 't4', roomId: 'r1', groupId: 'g3', day: DayOfWeek.FRIDAY, startTime: '14:00', endTime: '17:00', type: SessionType.LAB, color: '#10b981' },
  ]
};

// Helper for colors - Professional Monochrome / Grayscale
export const SESSION_COLORS = {
  [SessionType.LECTURE]: 'bg-white text-slate-900 border-slate-900',
  [SessionType.TUTORIAL]: 'bg-slate-50 text-slate-900 border-slate-900',
  [SessionType.LAB]: 'bg-slate-100 text-slate-900 border-slate-900',
  [SessionType.SEMINAR]: 'bg-slate-50 text-slate-900 border-slate-900',
};