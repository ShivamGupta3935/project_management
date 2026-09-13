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
   const { email, password, username } = req.body;

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
      emailVerificationToken,
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

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken -emailVerificationToken ",
   );

   if (!createdUser) {
      throw new ApiError(401, "User creation failed");
   }

   return res
      .status(201)
      .json(new ApiResponse(201, user, "User created successfully"));
});

export { registerUser };
