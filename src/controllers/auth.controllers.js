import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { emailVerficationMailgenContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshToken = async (userId) => {
   try {
      const user = await User.findById(userId);

      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();

      user.refreshToken = refreshToken;

      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
   } catch (error) {
      throw new ApiError(500, "something went wrong while creating tokens");
   }
};

const registerUser = asyncHandler(async (req, res) => {
   const { email, password, username, fullname } = req.body;

   const existedUser = await User.findOne({
      $or: [{ email }, { username }],
   });

   if (existedUser) {
      throw new ApiError(409, "user already exists");
   }

   const user = await User.create({
      username,
      email,
      password,
      fullname,
   });

   const { unhashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryTokens();

   user.emailVerificationToken = hashedToken;
   user.emailTokenExpiry = tokenExpiry;

   await user.save({ validateBeforeSave: false });

   await sendEmail({
      email: user?.email,
      subject: "verify your email",
      mailgenContent: emailVerficationMailgenContent(
         user.username,
         `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`,
      ),
   });

   const createdUser = await User.findById(user._id).select("-password ");

   console.log("created User : ", createdUser);
   if (!createdUser) {
      throw new ApiError(401, "User creation failed");
   }

   return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const login = asyncHandler(async (req, res) => {
   const { username, email, password } = req.body;

   if (!username && !email) {
      throw new ApiError(400, "username or email is required");
   }

   const user = await User.findOne({
      $or: [{ email }, { username }],
   });

   if (!user) {
      throw new ApiError(401, "Invalid credentials");
   }

   const isPasswordValid = await user.isPasswordCorrect(password);

   if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
   }

   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
   );

   const loggedInUser = await User.findById(user._id).select(
      "-password -forgotPasswordToken -emailVerificationToken -refreshToken",
   );

   const cookieOptions = {
      httpOnly: true,
      secure: true,
   };

   res.status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, loggedInUser, "user loggedIN successfully"));
});

export { registerUser, login };
