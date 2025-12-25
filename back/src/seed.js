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

       // 2. Create 3 Users (Teachers/Admins)
        const users = await User.insertMany([
            { username: "dr_ahmed", password: "password", email: "ahmed@univ.tn", isadmin: false },
            { username: "mme_salma", password: "password", email: "salma@univ.tn", isadmin: false },
            { username: "prof_ben_ali", password: "password", email: "benali@univ.tn", isadmin: true }
        ]);

        // 3. Create 3 Rooms
        const rooms = await Room.insertMany([
            { roomId: "lab-01", capacity: 20, type: "lab", equipment: ["PC", "Projector"] },
            { roomId: "amphi-a", capacity: 150, type: "lecture", equipment: ["Projector", "Mic"] },
            { roomId: "salle-td-102", capacity: 35, type: "seminar", equipment: ["Whiteboard"] }
        ]);

        // 4. Create 3 Groups
        const groups = await Groupe.insertMany([
            { speciality: "DSI-21", size: 25, yearOfStudy: 2 },
            { speciality: "RSI-11", size: 18, yearOfStudy: 1 },
            { speciality: "SEM-31", size: 30, yearOfStudy: 3 }
        ]);

        // 5. Create 3 Teacher Preferences
        await Preference.insertMany([
            {
                teacher: users[0]._id,
                unavailableDays: ["Saturday"],
                timePreferences: [{ day: "Monday", slot: "morning" }],
                maxHoursPerWeek: 18
            },
            {
                teacher: users[1]._id,
                unavailableDays: ["Friday"],
                timePreferences: [{ day: "Wednesday", slot: "evening" }],
                maxHoursPerWeek: 16
            },
            {
                teacher: users[2]._id,
                unavailableDays: ["Monday"],
                timePreferences: [{ day: "Tuesday", slot: "morning" }],
                maxHoursPerWeek: 20
            }
        ]);

        // 6. Create 3 Subjects
        const subjects = await Subject.insertMany([
            { 
                subjectname: "mern-stack", 
                code: "CS401", 
                totalHours: 60, 
                houresparweek: 3, 
            },
            { 
                subjectname: "math-logic", 
                code: "MT101", 
                totalHours: 45, 
                houresparweek: 4.5, 
            },
            { 
                subjectname: "cyber-security", 
                code: "SEC505", 
                totalHours: 30, 
                houresparweek: 1.5, 
            }
        ]);

        // 7. Create 3 Timetable Containers (Drafts)
        const timetables = await Timetable.insertMany([
            { name: "S1 - Draft 1", academicYear: "2024-2025", semester: 1, createdBy: users[2]._id, isPublished: false },
            { name: "S1 - Official", academicYear: "2024-2025", semester: 1, createdBy: users[2]._id, isPublished: true },
            { name: "S2 - Planning", academicYear: "2024-2025", semester: 2, createdBy: users[2]._id, isPublished: false }
        ]);

        // 8. Create 3 Sample Sessions
        await Session.insertMany([
            {
                subject: subjects[0]._id,
                teacher: users[0]._id,
                room: rooms[0]._id,
                group: groups[0]._id
            },
            {
                subject: subjects[1]._id,
                teacher: users[1]._id,
                room: rooms[1]._id,
                group: groups[1]._id
            },
            {
                subject: subjects[2]._id,
                teacher: users[2]._id,
                room: rooms[2]._id,
                group: groups[2]._id
            }
        ]);

        console.log("🌱 Database seeded with 3 examples per model!");
        return;
    } catch (error) {
        console.error("❌ Seeding error:", error);
        throw error;
    }
};

export default seedDB;