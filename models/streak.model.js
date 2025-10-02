import mongoose, { Schema } from 'mongoose'
import { User } from './user.model.js'

const streakSchema = new Schema (
    {
        owner : {
          type: Schema.Types.ObjectId,
          ref: "User"
        },
        currentStreak : {
            type : Number,
            required : true,
            default : 0
        },
        maxStreak : {
            type : Number ,
            required : true,
            default : 0,
        },
    }, 
    {  timestamps : true }
)

export const Streak = mongoose.model("Streak", streakSchema)