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
app.use("/api/v1/server-check", checkRoute)
app.use("/api/v1/user", userRoutes)
