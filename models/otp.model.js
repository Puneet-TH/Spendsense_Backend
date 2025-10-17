import mongoose,{Schema} from "mongoose";
import { User } from "./user.model.js";

const otpSchema = new Schema (
    {   email : {
            type : String,
            required : true
        },
        otp : {
            type : String,
            required : true
        },
        expiresIn : {
            type : Number,
            required : true
        }, 
    }, 
    {
       timestamps: true
    }
)

export const Otp = mongoose.model("Otp", otpSchema)