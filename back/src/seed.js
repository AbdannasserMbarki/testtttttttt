import { User } from './models/user.model.js';
import { Room } from './models/room.model.js';
import { Subject } from './models/subject.model.js';
import { Preference } from './models/preferences.model.js';
import { Session } from './models/session.model.js';
import { Timetable } from './models/timeTable.model.js';
import { groupe as Groupe } from './models/groupe.model.js';




const seedDB = async () => {
    try {
        // 1. Cleanup: Remove existing data to avoid duplicates
        await Promise.all([
            User.deleteMany({}),
            Room.deleteMany({}),
            Subject.deleteMany({}),
            Preference.deleteMany({}),
            Session.deleteMany({}),
            Timetable.deleteMany({}),
            Groupe.deleteMany({})
        ]);
       console.log("🧹 Database cleared.");

        // --- 1. TEACHERS (20) ---
        const teacherData = Array.from({ length: 20 }).map((_, i) => ({
            username: `teacher_${i + 1}`,
            password: "password123",
            email: `teacher${i + 1}@univ.tn`,
            isadmin: i === 0 // Make the first one admin
        }));
        const users = await User.insertMany(teacherData);

        // --- 2. ROOMS (15) ---
        // Mix of Labs, Amphis, and Classrooms
        const roomData = [
            ...Array.from({ length: 5 }).map((_, i) => ({ roomId: `LAB-${i+1}`, capacity: 20, type: "lab", equipment: ["PC", "Projector"] })),
            ...Array.from({ length: 3 }).map((_, i) => ({ roomId: `AMPHI-${String.fromCharCode(65+i)}`, capacity: 150, type: "lecture", equipment: ["Mic", "Projector"] })),
            ...Array.from({ length: 7 }).map((_, i) => ({ roomId: `ROOM-${101+i}`, capacity: 40, type: "seminar", equipment: ["Whiteboard"] }))
        ];
        const rooms = await Room.insertMany(roomData);

        // --- 3. GROUPS (10) ---
        const groupData = [
            { speciality: "DSI-21", size: 28, yearOfStudy: 2 },
            { speciality: "DSI-22", size: 25, yearOfStudy: 2 },
            { speciality: "RSI-11", size: 20, yearOfStudy: 1 },
            { speciality: "RSI-12", size: 22, yearOfStudy: 1 },
            { speciality: "SEM-31", size: 32, yearOfStudy: 3 },
            { speciality: "SEM-32", size: 30, yearOfStudy: 3 },
            { speciality: "MDW-11", size: 24, yearOfStudy: 1 },
            { speciality: "MDW-21", size: 26, yearOfStudy: 2 },
            { speciality: "TIC-11", size: 35, yearOfStudy: 1 },
            { speciality: "TIC-12", size: 33, yearOfStudy: 1 }
        ];
        const groups = await Groupe.insertMany(groupData);

        // --- 4. SUBJECTS (20) ---
        const subjectData = [
            { subjectname: "MERN Stack", code: "CS401", totalHours: 60, houresparweek: 3 },
            { subjectname: "Math Logic", code: "MT101", totalHours: 45, houresparweek: 1.5 },
            { subjectname: "Cyber Security", code: "SEC505", totalHours: 30, houresparweek: 1.5 },
            { subjectname: "Python for Data", code: "DS202", totalHours: 60, houresparweek: 3 },
            { subjectname: "Networking Basics", code: "NET101", totalHours: 45, houresparweek: 3 },
            { subjectname: "Project Management", code: "MG301", totalHours: 30, houresparweek: 1.5 },
            { subjectname: "Mobile Dev", code: "MOB402", totalHours: 60, houresparweek: 4.5 },
            { subjectname: "English Tech", code: "ENG101", totalHours: 30, houresparweek: 1.5 },
            { subjectname: "Cloud Computing", code: "CLD505", totalHours: 45, houresparweek: 3 },
            { subjectname: "Database SQL", code: "DB201", totalHours: 60, houresparweek: 3 },
            { subjectname: "UI/UX Design", code: "DES102", totalHours: 30, houresparweek: 1.5 },
            { subjectname: "Operating Systems", code: "OS202", totalHours: 45, houresparweek: 3 },
            { subjectname: "Machine Learning", code: "AI401", totalHours: 60, houresparweek: 4.5 },
            { subjectname: "DevOps", code: "DO501", totalHours: 45, houresparweek: 3 },
            { subjectname: "Soft Skills", code: "SS101", totalHours: 30, houresparweek: 1.5 },
            { subjectname: "Big Data", code: "BD505", totalHours: 60, houresparweek: 3 },
            { subjectname: "Java EE", code: "JV404", totalHours: 60, houresparweek: 4.5 },
            { subjectname: "Algorithms", code: "AL101", totalHours: 60, houresparweek: 3 },
            { subjectname: "Economics", code: "EC202", totalHours: 30, houresparweek: 1.5 },
            { subjectname: "Statistics", code: "ST102", totalHours: 45, houresparweek: 3 }
        ];
        const subjects = await Subject.insertMany(subjectData);

        // --- 5. PREFERENCES (For all 20 teachers) ---
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const slots = ["morning", "evening"];
        const prefData = users.map((t, i) => ({
            teacher: t._id,
            unavailableDays: [days[i % 6]], // Each teacher has a different day off
            timePreferences: [{ day: days[(i + 1) % 6], slot: slots[i % 2] }],
            maxHoursPerWeek: 15 + (i % 10)
        }));
        await Preference.insertMany(prefData);

        // --- 6. SAMPLE SESSIONS (Link Subjects to Groups/Teachers) ---
        // Let's create 25 sessions to ensure some groups have multiple classes
        
        const sessionData = Array.from({ length: 25 }).map((_, i) => ({
            subject: subjects[i % 20]._id,
            teacher: users[i % 20]._id,
            room: rooms[i % 15]._id,
            group: groups[i % 10]._id
            
        }));
        //console.log(sessionData)
        await Session.insertMany(sessionData);

        console.log(`🌱 Database seeded!
        - ${users.length} Teachers
        - ${rooms.length} Rooms
        - ${groups.length} Groups
        - ${subjects.length} Subjects
        - ${prefData.length} Preferences`);
    } catch (error) {
        console.error("❌ Seeding error:", error);
    }
};

export default seedDB;