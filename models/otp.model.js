import mongoose,{Schema} from "mongoose";
import { User } from "./user.model";

const otpSchema = new Schema (
    {   email : {
            type : String,
            required : true
        },
        otp : {
            type : Number,
            required : true
        },
        expiresIn : {
            type : Number,
            required : true
        }, 
        type : {
           type : String,
           required : false
        }
    }, 
    {
       timestamps: true
    }
)

export const Otp = mongoose.model("Otp", otpSchema)