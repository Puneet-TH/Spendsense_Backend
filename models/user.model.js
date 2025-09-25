import mongoose , {Schema} from "mongoose";
import jwt from  "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        nickName: {
            type: String,
            required: false,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
         email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
         fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        gender : {
            type: String,
            required : false
        },
        phoneNumber : {
            type: Number,
            required : true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        isEmailVerified : {
            type : Boolean,
            default: false,
        }
    },{timestamps:true})

//encrypting password
userSchema.pre("save", async function(next) {
         if(!this.isModified("password")) return next()
         this.password = await bcrypt.hash(this.password, 10)
         next()
}) 

userSchema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password, this.password)
}
//for validation
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)