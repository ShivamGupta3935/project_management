import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js"

// const healthcheckRoute = (req, res) => {
//    try {
//       res.status(200).json(
//          new ApiResponse(200, { message: "server is running" }),
//       );
//    } catch (error) {
//       throw new ApiError(500, "server connection failed");
//    }
// };

const healthcheckRoute = asyncHandler( async(req, res) => {
   res.status(200).json(new ApiResponse(200, {message: "server is running |||"}))
})


export { healthcheckRoute };

