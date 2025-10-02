import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SendOtpThroughMail } from "../utils/SendOtpThroughMail.js";
import { Otp } from "../models/otp.model.js";
import { generateNumericOTP } from "../utils/OtpGeneration.js";
import jwt from  "jsonwebtoken"

const generateAccessToken = async(userId) => {
    try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()  
      //since db is an object so adding data in object using . simple
      await user.save({validateBeforeSave: false})//checks for if teh required fields are there or not if enabled false bypass these check bydefault

      return {accessToken}
    } catch (error) {
       throw new ApiError(500, "Something went wrong while generating token")
    }
}

const registerUser = AsyncHandler(async(req, res) => {
    const {nickName, email, fullName,  gender,  phoneNumber,  password} = req.body 
    if(!email || !phoneNumber || !password || !gender || !fullName) {
        throw new ApiError(401, "all listed fields except nickName fields are mandatory to fill")
    }
    
    try {
            const user = await User.findOne({email : email}) 
            if(user){
                return res
                    .status(200)
                    .json(new ApiResponse(200, user, "user is already present login using correct credentials"))
            }
            else {
                const createdUser = await User.create(
                    {
                        email : email,
                        fullName : fullName,
                        nickName : email.split('@')[0],
                        phoneNumber : phoneNumber,
                        gender: gender,
                        password : password,
                    }
                )
                
                 const createdUserCheck = await User.findById(createdUser._id).select(
                 "-password" )

                if (!createdUserCheck) {
                    throw new ApiError(500, "Something went wrong while registering the user")
                }
                return res.status(200).json(new ApiResponse(200, createdUser, "user registered successfully please verify you mail now"))
            }
    } catch (error) {
        throw new ApiError(401, error? error : "unable to register new user server is busy")
    }
})
//login, logout, passwordchange, oauth, updateuserdetails
const loginUser = AsyncHandler(async(req, res) => {
    const {email, password} = req.body
    if(!email || !password) {
        throw new ApiError(401, "all fields are mandatory for logging in")
    }
    const user = await User.findOne({email : email})
    if(!user){
        throw new ApiError(401, "User not found register first")
    }
    const isPasswordValid =  await user.isPasswordCorrect(password)
    if(!isPasswordValid){
          throw new ApiError(402, "password is incorrect retry again")
    }
    const {accessToken} = await generateAccessToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password")


    const options = {
      httOnly : true,
      secure: true
     }

     return  res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json(
            new ApiResponse(
                200,
                {
                    user : loggedInUser, accessToken
                },
                "user logged in success"
            )
            )
})

const logoutUser = AsyncHandler(async(req, res) => {
    const {userId} = req.user._id
    if(!userId) {
        throw new ApiError(401, "user not logged in userId not there")
    }
     
     const options = {
      httOnly : true,
      secure: true
     }
  
     return res
     .status(200)
     .clearCookie("accessToken", options)
     .json(new ApiResponse(200, {userId}, "User logged Out"))

})

//leaving oauth cause need SHA1 certifcate and .xml name for flutter later will add.

const getCurrentUser  = AsyncHandler(async(req, res) => {
       return  res
       .status(200)
       .json(new ApiResponse(200, req.user, "current user fetched succesfully"))
      
 })

 const updateUserDetails = AsyncHandler(async(req, res) => {
    const {nickName, email, fullName,  gender,  phoneNumber} = req.body
    if(nickName || email || fullName || gender || phoneNumber){
          const existingUser = await User.findOne({
         $and: [
         { _id: { $ne: req.user._id } }, //checking if any user is present already
         { $or: [{ fullName }, { email }] }
                ]
        });
        
        if(existingUser.fullName === fullName){
            throw new ApiError(404 , "username already exist give a new one")
        }

        if(existingUser.email === email){
            throw new ApiError(404, "email already exist in db give a new one")
        }
        
           const updates = {};
            if (nickName) updates.nickName = nickName;
            if (gender) updates.gender = gender;
            if (fullName) updates.fullName = fullName;
            if (email) updates.email = email;
            if (phoneNumber) updates.phoneNumber = phoneNumber;

        const user = await User.findByIdAndUpdate(req.user?._id, {
                 $set : updates
        }, {new : true, runValidators: true})
        
        if(!user){
            throw new ApiError(401, "user not updated successfully")
        }

        return res.status(200).json(new ApiResponse(200, user, "user data updated successfully"))
    }
    else {
        throw new ApiError(401, "no fields given to update")
    }
 })

 //forgot password.
const sendPasswordresetOtp = AsyncHandler(async(req, res) => {
      const {email} = req.body
      if(!email){
        throw new ApiError(401, "email field is mandatory")
      }

      const user = User.findOne({email : email})
      if(!user){
        throw new ApiError(404, "no user with this email is present")
      }
      
    const generatedOtp = generateNumericOTP(6)
    const expiresIn = Date.now() + 9 * 60 * 1000 //9 minute

    const existingUsersOtp = await Otp.deleteMany({email : email,type : "passwordReset"}) 
    const newUserOtpForReset = await Otp.create(
        {
            email : email,
            type : "passwordReset",
            otp : generatedOtp,
            expiresIn : expiresIn
        }
    )

    if(!newUserOtpForReset){
        throw new ApiError(501, "otp not saved error in db")
    }
    
    const sendOtpViaMail = await SendOtpThroughMail(generatedOtp, email)
    if(!sendOtpViaMail){
        const existingOtp = await Otp.deleteMany({email : email, type : "passwordReset"})
        throw new ApiError(402, "all existing otp related password reset removed successfully")
    }
    
    return res
           .status(200)
           .json(new ApiResponse(200, {
            email : newUserOtpForReset.email,
            type : newUserOtpForReset.type
           } , "otp sent successfully"))
})

const verifyPasswordResetOtp = AsyncHandler(async(req, res) => {
       const {email, otp} = req.body
       if(!email || !otp){
        throw new ApiError(401,"please provide otp for verification")
       }
       console.log(email, otp)

        try {
                const existingOtpRecord = await Otp.findOne({email : email, type : "passwordReset"})
                console.log(existingOtpRecord.expiresIn)
                if(Date.now() > existingOtpRecord.expiresIn) {
                    await Otp.deleteOne({ email, type: "passwordReset" });
                    throw new ApiError(400, "OTP has expired. Please request a new one.");
                }
                console.log(parseInt(otp), existingOtpRecord.otp)
                if(parseInt(otp) !== parseInt(existingOtpRecord.otp)){
                    throw new ApiError(401, "otp is invalid try again")
                }
        
                const temproryToken = jwt.sign(
                        {
                            _id: existingOtpRecord._id,
                            email: existingOtpRecord.email,
                            purpose : "passwordReset"
                        },
                        process.env.ACCESS_TOKEN_SECRET,
                        {
                            expiresIn: "15min"
                        }
                    )
        
                if(!temproryToken) {
                    throw new ApiError(401, "token not generated try again later")
                }
        
            return res
                    .status(200)
                    .json(new ApiResponse(200, {
                        token : temproryToken,
                        email : email
                    }, "reset token are genereated successfully"))
                
        } catch (error) {
            throw new ApiError(500, error? error : "unable to generate token try again later")
        }
})

const resetPassword = AsyncHandler(async(req, res) => {
             const{token, newPassword , confirmPassword} = req.body
             if(!token || !newPassword || !confirmPassword){
                throw new ApiError(401, "all fields are mandatory for changing password")
             }
             
             if(newPassword !== confirmPassword) {
                  throw new ApiError(400, "Passwords do not match");
             }
              
        try {
              const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
              console.log(decoded.email);

              if(decoded.purpose !== "passwordReset"){
                  throw new ApiError(400, "Invalid reset token");
              }
    
              const user = await User.findOne({ email: decoded.email });
                if(!user) {
                    throw new ApiError(404, "User not found");
                }
           
              user.password = newPassword
              await user.save()
    
              const deleteExistingOtp = await Otp.deleteMany(
                {email : decoded.email, purpose : "passwordReset"}
              )
            return res.status(200).json(
                new ApiResponse(200, 
                    { email: decoded.email }, 
                    "Password reset successfully. You can now login with your new password."
                )
            );
        } catch (error) {
            throw new ApiError(500, error? error : "Something went wrong try again later")
        }
})


//testing left //

//testing done//
export{
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUserDetails,
    sendPasswordresetOtp,
    verifyPasswordResetOtp,
    resetPassword
}