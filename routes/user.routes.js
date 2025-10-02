import { Router } from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUserDetails,
    sendPasswordresetOtp,
    verifyPasswordResetOtp,
    resetPassword } from '../controllers/user.controller.js'
import { verifyJWT } from "../middlewares/Auth.js";

const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
//forgot password routes
router.route("/send-reset-otp").post(sendPasswordresetOtp);
router.route("/verify-reset-otp").post(verifyPasswordResetOtp);
router.route("/reset-password").post(resetPassword);
//secured routes requires authentication first using jwt token
router.route("/u/get-current-User").get(verifyJWT, getCurrentUser);
router.route("/u/update-user").post(verifyJWT,updateUserDetails);


export default router
