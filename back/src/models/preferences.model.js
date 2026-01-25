import mongoose, { Schema } from "mongoose";

const preferenceSchema = new Schema(
    {
        teacher: {
            type: Schema.Types.ObjectId,
            ref: "User", 
            required: true,
            unique: true 
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
    },
    { timestamps: true }
);

export const Preference = mongoose.model("Preference", preferenceSchema);