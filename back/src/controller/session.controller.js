import { Session } from '../models/session.model.js';

const createSession = async (req, res) => {
    try {
        const { subject, teacher, group, room } = req.body;

        if (!subject || !teacher || !group) {
            return res.status(400).json({ message: "subject, teacher and group are required" });
        }

        const session = await Session.create({ subject, teacher, group, room });

        return res.status(201).json({
            message: "Session created successfully",
            session
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate('subject')
            .populate('teacher', '-password')
            .populate('group')
            .populate('room');

        return res.status(200).json({
            message: "Sessions fetched successfully",
            sessions
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findById(id)
            .populate('subject')
            .populate('teacher', '-password')
            .populate('group')
            .populate('room');

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        return res.status(200).json({
            message: "Session fetched successfully",
            session
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const updateSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        return res.status(200).json({
            message: "Session updated successfully",
            session
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const deleteSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Session.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Session not found" });
        }

        return res.status(200).json({
            message: "Session deleted successfully",
            session: deleted
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

export {
    createSession,
    getAllSessions,
    getSessionById,
    updateSessionById,
    deleteSessionById
};
