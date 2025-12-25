import { Room } from '../models/room.model.js';

const createRoom = async (req, res) => {
    try {
        const { roomId, capacity, equipment, type } = req.body;

        if (!roomId || capacity === undefined) {
            return res.status(400).json({ message: "roomId and capacity are required" });
        }

        const existing = await Room.findOne({ roomId: roomId.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: "Room already exists" });
        }

        const newRoom = await Room.create({
            roomId: roomId.toLowerCase(),
            capacity,
            equipment: equipment || [],
            type: type || 'lecture'
        });

        return res.status(201).json({
            message: "Room created successfully",
            room: {
                id: newRoom._id,
                roomId: newRoom.roomId,
                capacity: newRoom.capacity,
                equipment: newRoom.equipment,
                type: newRoom.type
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();

        return res.status(200).json({
            message: "Rooms fetched successfully",
            rooms
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        return res.status(200).json({
            message: "Room fetched successfully",
            room
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const updateRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomId, capacity, equipment, type } = req.body;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (roomId !== undefined) {
            const existing = await Room.findOne({ roomId: roomId.toLowerCase(), _id: { $ne: id } });
            if (existing) {
                return res.status(400).json({ message: "roomId already in use" });
            }
            room.roomId = roomId.toLowerCase();
        }

        if (capacity !== undefined) {
            room.capacity = capacity;
        }

        if (equipment !== undefined) {
            room.equipment = equipment;
        }

        if (type !== undefined) {
            room.type = type;
        }

        await room.save();

        return res.status(200).json({
            message: "Room updated successfully",
            room: {
                id: room._id,
                roomId: room.roomId,
                capacity: room.capacity,
                equipment: room.equipment,
                type: room.type
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

const deleteRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Room.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Room not found" });
        }

        return res.status(200).json({
            message: "Room deleted successfully",
            room: {
                id: deleted._id,
                roomId: deleted.roomId,
                capacity: deleted.capacity,
                equipment: deleted.equipment,
                type: deleted.type
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error :", error: error.message });
    }
};

export {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoomById,
    deleteRoomById
};
