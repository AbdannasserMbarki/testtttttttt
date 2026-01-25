import mongoose, {Schema} from "mongoose";

const subjectSchema= new Schema(
    {
        subjectname:{  // Like reseau TP
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        code:{
            type: String,
            required: true,
            unique: true,
        },
        totalHours:{
            type: Number,
        },
    },
    {
        timestamps:true
    }
);


export const Subject= mongoose.model("Subject", subjectSchema);