import { Router } from "express";
import {  updateUserStreak, 
     getCurrentStreak 
} from "../controllers/streak.controller.js";
import { verifyJWT } from "../middlewares/Auth.js";


const router = Router();
router.route("/update-user-streak").post(verifyJWT, updateUserStreak)
router.route("/current-user-streak").get(verifyJWT, getCurrentStreak)

export default router