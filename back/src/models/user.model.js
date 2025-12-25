import mongoose, {Schema} from "mongoose";

const userSchema= new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        password:{
            type: String,
            required: true,
            minlength: 6,
            maxlength: 50,
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        isadmin:{
            type: Boolean,
            default: false
        },
    },
    {
        timestamps:true
    }
);

export const User= mongoose.model("User", userSchema);

