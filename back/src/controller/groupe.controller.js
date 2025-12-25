import { groupe } from '../models/groupe.model.js';

const createGroupe = async (req, res) => {
    try {
        const { speciality, size, yearOfStudy } = req.body;

        if (!speciality || size === undefined || yearOfStudy === undefined) {
            return res.status(400).json({ message: "speciality, size and yearOfStudy are required" });
        }

        const existing = await groupe.findOne({ speciality: speciality.trim() });
        if (existing) {
            return res.status(400).json({ message: "Groupe already exists" });
        }

        const newGroupe = await groupe.create({
            speciality: speciality.trim(),
            size,
            yearOfStudy
        });

        return res.status(201).json({
            message: "Groupe created successfully",
            groupe: {
                id: newGroupe._id,
                speciality: newGroupe.speciality,
                size: newGroupe.size,
                yearOfStudy: newGroupe.yearOfStudy
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getAllGroupes = async (req, res) => {
    try {
        const groupes = await groupe.find();

        return res.status(200).json({
            message: "Groupes fetched successfully",
            groupes
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getGroupeById = async (req, res) => {
    try {
        const { id } = req.params;

        const oneGroupe = await groupe.findById(id);
        if (!oneGroupe) {
            return res.status(404).json({ message: "Groupe not found" });
        }

        return res.status(200).json({
            message: "Groupe fetched successfully",
            groupe: oneGroupe
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const updateGroupeById = async (req, res) => {
    try {
        const { id } = req.params;
        const { speciality, size, yearOfStudy } = req.body;

        const oneGroupe = await groupe.findById(id);
        if (!oneGroupe) {
            return res.status(404).json({ message: "Groupe not found" });
        }

        if (speciality !== undefined) {
            const existing = await groupe.findOne({ speciality: speciality.trim(), _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: "speciality already in use" });
            }
            oneGroupe.speciality = speciality.trim();
        }

        if (size !== undefined) {
            oneGroupe.size = size;
        }

        if (yearOfStudy !== undefined) {
            oneGroupe.yearOfStudy = yearOfStudy;
        }

        await oneGroupe.save();

        return res.status(200).json({
            message: "Groupe updated successfully",
            groupe: {
                id: oneGroupe._id,
                speciality: oneGroupe.speciality,
                size: oneGroupe.size,
                yearOfStudy: oneGroupe.yearOfStudy
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const deleteGroupeById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await groupe.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Groupe not found" });
        }

        return res.status(200).json({
            message: "Groupe deleted successfully",
            groupe: {
                id: deleted._id,
                speciality: deleted.speciality,
                size: deleted.size,
                yearOfStudy: deleted.yearOfStudy
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

export {
    createGroupe,
    getAllGroupes,
    getGroupeById,
    updateGroupeById,
    deleteGroupeById
};
