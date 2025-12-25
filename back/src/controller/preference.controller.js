import { Preference } from '../models/preferences.model.js';

const createPreference = async (req, res) => {
    try {
        const { teacher, unavailableDays, timePreferences, maxHoursPerDay, maxHoursPerWeek } = req.body;
        if (!teacher) {
            return res.status(400).json({ message: "teacher is required" });
        }
        const existing = await Preference.findOne({ teacher });
        if (existing) {
            return res.status(400).json({ message: "Preference already exists for this teacher" });
        }
        const preference = await Preference.create({
            teacher,
            unavailableDays: unavailableDays || [],
            timePreferences: timePreferences || [],
            maxHoursPerDay,
            maxHoursPerWeek
        });
        return res.status(201).json({
            message: "Preference created successfully",
            preference
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getAllPreferences = async (req, res) => {
    try {
        const preferences = await Preference.find().populate('teacher', '-password');

        return res.status(200).json({
            message: "Preferences fetched successfully",
            preferences
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getPreferenceByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const preference = await Preference.findOne({ teacher: teacherId }).populate('teacher', '-password');
        if (!preference) {
            return res.status(404).json({ message: "Preference not found" });
        }

        return res.status(200).json({
            message: "Preference fetched successfully",
            preference
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const updatePreferenceByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { unavailableDays, timePreferences, maxHoursPerDay, maxHoursPerWeek } = req.body;

        const preference = await Preference.findOneAndUpdate(
            { teacher: teacherId },
            {
                teacher: teacherId,
                unavailableDays: unavailableDays || [],
                timePreferences: timePreferences || [],
                maxHoursPerDay,
                maxHoursPerWeek
            },
            { new: true, runValidators: true }
        );

        if (!preference) {
            return res.status(404).json({ message: "Preference not found" });
        }

        return res.status(200).json({
            message: "Preference updated successfully",
            preference
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const deletePreferenceByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const deleted = await Preference.findOneAndDelete({ teacher: teacherId });
        if (!deleted) {
            return res.status(404).json({ message: "Preference not found" });
        }

        return res.status(200).json({
            message: "Preference deleted successfully",
            preference: deleted
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};


export {
    getAllPreferences,
    getPreferenceByTeacher,
    updatePreferenceByTeacher,
    deletePreferenceByTeacher,
    createPreference
};
