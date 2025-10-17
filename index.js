import express from 'express'
import dotenv from "dotenv"
import connectDB from "./db/db.js";
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express()
dotenv.config(
    {path: './env'}
)
const Port = process.env.PORT || 8000; 
//connecting database
connectDB()
.then(() =>{
    app.listen(Port, () => {
        console.log(`server is running at port : ${Port}`)
    })
})
.catch((err) => {
    console.log("MONGO DB CONNECTION FAILED !!", err);
})

//cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import checkRoute from './routes/check.routes.js'
import userRoutes from './routes/user.routes.js'
import streakRoutes from './routes/streak.routes.js'
import expenseRoutes from './routes/expense.routes.js'
import otpRoutes from './routes/otp.routes.js'



app.use("/api/v1/server-check", checkRoute)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/user-streak", streakRoutes)
app.use("/api/v1/user-expense", expenseRoutes)
app.use("/api/v1/otp", otpRoutes)

//used for seeding categories in category model for default category searching.
// import { seedCategories } from './controllers/category.controller.js';
 // await seedCategories();