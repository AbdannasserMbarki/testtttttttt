import mongoose, {Schema} from "mongoose";

const groupeSchema= new Schema(
    {
        speciality:{
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        size:{
            type: Number,
            required: true,
        },

        yearOfStudy:{
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        timestamps:true
    }
);


export const groupe= mongoose.model("groupe", groupeSchema);