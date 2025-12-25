import mongoose, { Schema } from "mongoose";

const preferenceSchema = new Schema(
    {
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "User", 
            required: true,
            unique: true 
        },
        // Hard Constraints: Days they absolutely cannot work
        unavailableDays: {
            type: [String],
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            default: []
        },
        // Soft Constraints: Preferred time slots
        timePreferences: [
            {
                day: { 
                    type: String, 
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] 
                },
                slot: { 
                    type: String, 
                    enum: ["morning", "evening", "any"],
                    default: "any"
                },
            }
        ],

        maxHoursPerWeek: {
            type: Number,
            default: 30,
            min: 1,
            max: 40
        },
    },
    { timestamps: true }
);

export const Preference = mongoose.model("Preference", preferenceSchema);