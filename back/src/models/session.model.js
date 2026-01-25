import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
    {
        subject: { 
            type: Schema.Types.ObjectId, 
            ref: "Subject", 
            required: true 
        },
        teacher: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
          group: { 
            type: Schema.Types.ObjectId, 
            ref: "groupe", 
            required: true 
        },
      
    },
    { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);