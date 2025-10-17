import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import { Router } from "express";

const router = Router()

//no need to put any authentication check as user first is verifying its email so no need to check if he is authenticated first

router.route("/o/send-otp").post(sendOtp)
router.route("/o/verify-otp").post(verifyOtp)

export default router