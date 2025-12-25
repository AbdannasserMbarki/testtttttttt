import { Subject } from '../models/subject.model.js';

const createSubject = async (req, res) => {
    try {
        const { subjectname, code, houresparweek, type, totalHours } = req.body;

        if (!subjectname || !code || houresparweek === undefined) {
            return res.status(400).json({ message: "subjectname, code and houresparweek are required" });
        }

        const existingByCode = await Subject.findOne({ code });
        if (existingByCode) {
            return res.status(400).json({ message: "Subject code already exists" });
        }

        const existingByName = await Subject.findOne({ subjectname: subjectname.toLowerCase() });
        if (existingByName) {
            return res.status(400).json({ message: "Subject already exists" });
        }

        const newSubject = await Subject.create({
            subjectname: subjectname.toLowerCase(),
            code,
            houresparweek,
            type: type || 'CR',
            totalHours
        });

        return res.status(201).json({
            message: "Subject created successfully",
            subject: {
                id: newSubject._id,
                subjectname: newSubject.subjectname,
                code: newSubject.code,
                totalHours: newSubject.totalHours,
                houresparweek: newSubject.houresparweek,
                type: newSubject.type
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();

        return res.status(200).json({
            message: "Subjects fetched successfully",
            subjects
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        return res.status(200).json({
            message: "Subject fetched successfully",
            subject
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const updateSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const { subjectname, code, totalHours, houresparweek, type } = req.body;

        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        if (subjectname !== undefined) {
            const existing = await Subject.findOne({ subjectname: subjectname.toLowerCase(), _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: "subjectname already in use" });
            }
            subject.subjectname = subjectname.toLowerCase();
        }

        if (code !== undefined) {
            const existing = await Subject.findOne({ code, _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: "code already in use" });
            }
            subject.code = code;
        }

        if (totalHours !== undefined) {
            subject.totalHours = totalHours;
        }

        if (houresparweek !== undefined) {
            subject.houresparweek = houresparweek;
        }

        if (type !== undefined) {
            subject.type = type;
        }

        await subject.save();

        return res.status(200).json({
            message: "Subject updated successfully",
            subject: {
                id: subject._id,
                subjectname: subject.subjectname,
                code: subject.code,
                totalHours: subject.totalHours,
                houresparweek: subject.houresparweek,
                type: subject.type
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const deleteSubjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Subject.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Subject not found" });
        }

        return res.status(200).json({
            message: "Subject deleted successfully",
            subject: {
                id: deleted._id,
                subjectname: deleted.subjectname,
                code: deleted.code,
                totalHours: deleted.totalHours,
                houresparweek: deleted.houresparweek,
                type: deleted.type
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

export {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubjectById,
    deleteSubjectById
};
