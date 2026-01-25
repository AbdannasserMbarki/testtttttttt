import mongoose, { Schema } from "mongoose";

const timetableEntrySchema = new Schema(
    {
        subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
        teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
        group: { type: Schema.Types.ObjectId, ref: "groupe", required: true },
        room: { type: Schema.Types.ObjectId, ref: "Room" },
        day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            required: true
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
    },
    { _id: false }
);

const timetableSchema = new Schema({
    name: { type: String, required: true }, // e.g., "Spring 2025 - Draft 1"
    academicYear: String,
    semester: {
        type: Number,
        enum: [1, 2],
        required: true
    },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },

    entries: {
        type: [timetableEntrySchema],
        default: []
    },
    generationConfig: {
        days: { type: [String], default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"] },
        timeSlots: { type: [Schema.Types.Mixed], default: [] },
        allowedSessionDurationsMinutes: { type: [Number], default: [] }
    },
    fitnessScore: { type: Number, default: null }
},
{ timestamps: true }
);

export const Timetable = mongoose.model("Timetable", timetableSchema);