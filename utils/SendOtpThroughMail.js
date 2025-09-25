import nodemailer from "nodemailer";
import { ApiResponse } from "./ApiResponse";
import { ApiError } from "./ApiError";


async function SendOtpThroughMail(otp, email){
try {
    if(!otp || !email) {
        throw new ApiError("401", "give both email and otp generated")
    }
    const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
     const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: "Your Otp",
                text: `your one time password is ${otp}`
         };
      await transporter.sendMail(mailOptions);
    return new ApiResponse(200, "otp sended successfully")
} catch (error) {
    throw new ApiError(error? error : "something went wrong while sending otp ")
}}

export{SendOtpThroughMail}
