import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError} from "../utils/ApiError.js";
import { generateNumericOTP } from "../utils/OtpGeneration.js";    
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { SendOtpThroughMail } from "../utils/SendOtpThroughMail.js";

//check these two.
const sendOtp = AsyncHandler(async(req, res) => {
    const { email } = req.body;
    
    if(!email) {
        throw new ApiError(400, "Email is required");
    }

    // Check if user exists - REQUIRED for email verification
    const user = await User.findOne({ email });
    if(!user) {
        throw new ApiError(404, "User not found. Please register first.");
    }

    // Check if email is already verified
    if(user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified. You can login directly.");
    }
    
    const generatedOtp = generateNumericOTP(6);
    if(!generatedOtp){
        throw new ApiError(500, "Failed to generate OTP. Please try again.");
    }
    
    const expiryTime = Date.now() + 3 * 60 * 1000; 
    
    try {
        // Delete any existing OTP for this email
        await Otp.deleteMany({ email });
        
        const otpRecord = await Otp.create({
            email,
            otp: generatedOtp,
            expiresIn: expiryTime,
        });
        // Send OTP via email
        const emailSent = await SendOtpThroughMail(generatedOtp, email);
        if(!emailSent) {
            await Otp.findByIdAndDelete(otpRecord?._id);
            throw new ApiError(500, "Failed to send verification email. Please try again.");
        }
        
        return res.status(200).json(
            new ApiResponse(200, 
                { 
                    email,
                    expiresAt: new Date(expiryTime),
                    userName: user.fullName
                }, 
                "Verification OTP sent to your email. Valid for 3 minutes."
            )
        );
        
    } catch (error) {
        throw new ApiError(500, "Failed to generate and send OTP. Please try again.");
    }
})

const verifyOtp = AsyncHandler(async(req, res) => {
    const { otp, email, fullName } = req.body;
    if(!otp || !email) {
        throw new ApiError(400, "OTP and email are required");
    }
    
    try {
        // Find OTP record  //error
        const otpRecord = await Otp.findOne({ email });
        if(!otpRecord) {
            throw new ApiError(400, "No OTP found. Please request a new OTP.");
        }
        if(Date.now() > otpRecord.expiresIn) {
            await Otp.deleteOne({ email: email});
            throw new ApiError(400, "OTP has expired. Please request a new OTP.");
        }
        
        // Verify OTP record with the given otp
        if(parseInt(otp) !== parseInt(otpRecord.otp)) {
            throw new ApiError(400, "Invalid OTP. Please check and try again.");
        }
        
        // OTP is valid - find the existing user
        const user = await User.findOne({ email: email});
        
        if(!user) {
            throw new ApiError(404, "User not found. Please register first.");
        }
        
        // Mark email as verified
        user.isEmailVerified = true;
        await user.save();
        
        // Delete the used OTP
        await Otp.deleteOne({ email : email});
        
        const token = user.generateAccessToken();
        
        const userData = {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            nickName: user.nickName,
            gender: user.gender,
            phoneNumber: user.phoneNumber,
            isEmailVerified: user.isEmailVerified
        };
        
        return res.status(200).json(
            new ApiResponse(200, 
                { 
                    user: userData,
                    token
                }, 
                "Email verified successfully. You can now access the app."
            )
        );
        
    } catch (error) {
        throw new ApiError(500,error,"failed to verify otp");
    }
})
export { sendOtp, verifyOtp };