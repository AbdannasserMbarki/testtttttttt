
import { Timetable } from "../models/timeTable.model.js";
import { Session } from "../models/session.model.js";
import { Room } from "../models/room.model.js";
import { Preference } from "../models/preferences.model.js";
import { Subject } from "../models/subject.model.js";
import { evolve } from "../utilities/geneticEngine.js";
import { calculateFitness } from "../utilities/fitness.js";

const createTimetable = async (req, res) => {
    try {
        const { name, academicYear, semester, createdBy, isPublished } = req.body;

        if (!name || semester === undefined) {
            return res.status(400).json({ message: "name and semester are required" });
        }

        const timetable = await Timetable.create({
            name,
            academicYear,
            semester,
            createdBy,
            isPublished: isPublished || false
        });

        return res.status(201).json({
            message: "Timetable created successfully",
            timetable
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getAllTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Timetables fetched successfully",
            timetables
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getTimetableById = async (req, res) => {
    try {
        const { id } = req.params;

        const timetable = await Timetable.findById(id)
            .populate("createdBy", "-password")
            .populate("entries.subject")
            .populate("entries.teacher", "-password")
            .populate("entries.group")
            .populate("entries.room");

        if (!timetable) {
            return res.status(404).json({ message: "Timetable not found" });
        }

        return res.status(200).json({
            message: "Timetable fetched successfully",
            timetable
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const updateTimetableById = async (req, res) => {
    try {
        const { id } = req.params;

        const timetable = await Timetable.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!timetable) {
            return res.status(404).json({ message: "Timetable not found" });
        }

        return res.status(200).json({
            message: "Timetable updated successfully",
            timetable
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const deleteTimetableById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Timetable.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Timetable not found" });
        }

        return res.status(200).json({
            message: "Timetable deleted successfully",
            timetable: deleted
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const generateTimetable = async (req, res) => {
    try {
        const {
            name,
            academicYear,
            semester,
            createdBy,
            days,
            timeSlots,
            allowedSessionDurationsMinutes,
            sessions
        } = req.body;

        console.log(req.body);

        if (!name || semester === undefined) {
            return res.status(400).json({ message: "name and semester are required" });
        }

        const usedDays = Array.isArray(days) && days.length > 0
            ? days
            : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        const defaultTimeSlots = [
            { start: "08:15", end: "09:45" },
            { start: "10:00", end: "11:30" },
            { start: "11:45", end: "13:15" },
            { start: "15:00", end: "16:30" },
            { start: "16:45", end: "18:15" }
        ];
        const usedTimeSlots = Array.isArray(timeSlots) && timeSlots.length > 0 ? timeSlots : defaultTimeSlots;

        const [availableRooms, preferences, subjects] = await Promise.all([
            Room.find(),
            Preference.find(),
            Subject.find()
        ]);

        const preferencesByTeacher = {};
        for (const p of preferences) {
            preferencesByTeacher[p.teacher.toString()] = p;
        }

        const subjectsById = {};
        for (const s of subjects) {
            subjectsById[s._id.toString()] = s;
        }

        const initialSessions = Array.isArray(sessions) && sessions.length > 0
            ? sessions
            : await Session.find().lean();

        if (!Array.isArray(initialSessions) || initialSessions.length === 0) {
            return res.status(400).json({ message: "No sessions provided and no sessions found in database" });
        }

        if (!Array.isArray(availableRooms) || availableRooms.length === 0) {
            return res.status(400).json({ message: "No rooms found in database" });
        }

        const fitnessOptions = {
            preferencesByTeacher,
            subjectsById,
            days: usedDays
        };

        const best = evolve(initialSessions, availableRooms, usedTimeSlots, fitnessOptions);
        const bestScore = calculateFitness(best, availableRooms, fitnessOptions);

        const timetable = await Timetable.create({
            name,
            academicYear,
            semester,
            createdBy,
            isPublished: false,
            entries: best.map((s) => ({
                subject: s.subject,
                teacher: s.teacher,
                group: s.group,
                room: s.room,
                day: s.day,
                startTime: s.startTime,
                endTime: s.endTime
            })),
            generationConfig: {
                days: usedDays,
                timeSlots: usedTimeSlots,
                allowedSessionDurationsMinutes: Array.isArray(allowedSessionDurationsMinutes)
                    ? allowedSessionDurationsMinutes
                    : []
            },
            fitnessScore: bestScore
        });

        const populated = await Timetable.findById(timetable._id)
            .populate("createdBy", "-password")
            .populate("entries.subject")
            .populate("entries.teacher", "-password")
            .populate("entries.group")
            .populate("entries.room");

        return res.status(201).json({
            message: "Timetable generated successfully",
            timetable: populated
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

export {
    createTimetable,
    getAllTimetables,
    getTimetableById,
    updateTimetableById,
    deleteTimetableById,
    generateTimetable
};

