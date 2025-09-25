import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { AsyncHandler } from '../utils/AsyncHandler.js'
import { User } from '../models/user.model.js'

const verifyJWT = AsyncHandler(async(req, res, next) => {
    try {
        // Get token from Authorization header (preferred for mobile apps) or cookies
        const authHeader = req.header("Authorization");
        const token = authHeader?.startsWith("Bearer ") 
            ? authHeader.replace("Bearer ", "")
            : req.cookies?.accessToken;
        
        if(!token){
            throw new ApiError(401, "Access token required. Please login first.");
        }
        // Verify JWT token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find user and exclude sensitive data
        const user = await User.findById(decodedToken?._id).select("-password");
        
        if(!user){
            throw new ApiError(401, "Invalid access token. User not found.");
        }
        
        // Add user to request object
        req.user = user;
        next();
        
    } catch (error) {
        throw new ApiError(error ? error : "error in the token check for the format or token or try again later")
    }
})

export { verifyJWT }