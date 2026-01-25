import mongoose, {Schema} from "mongoose";

const roomSchema= new Schema(
    {
        roomId:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        capacity:{
            type: Number,
            required: true,
        },
        equipment:{
            type: [String],
            default: []
        },

    },
    {
        timestamps:true
    }
);


export const Room = mongoose.model("Room", roomSchema);