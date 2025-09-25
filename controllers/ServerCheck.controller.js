import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const Check = AsyncHandler(async(req, res) => {
    return res
           .status(200)
           .json(new ApiResponse(200, "Server is running gooooood"))
})

export{Check}