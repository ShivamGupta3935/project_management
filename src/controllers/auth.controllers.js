import ApiError from "../utils/api-error.js";
import ApiResponse from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import {
   emailVerficationMailgenContent,
   forgotPasswordMailgenContent,
   sendEmail,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";

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

const logout = asyncHandler(async (req, res) => {
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            refreshToken: "",
         },
      },
      {
         returnDocument: "after",
      },
   );

   console.log("logout: ", user);
   const cookieOptions = {
      httpOnly: true,
      secure: true,
   };

   return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, {}, "User Logout successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
   const { verificationToken } = req.params;

   if (!verificationToken) {
      throw new ApiError(404, "Invalid token");
   }

   const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(unhashedToken)
      .digest("hex");

   const user = await User.findOne({
      emailVerificationToken: hashedVerificationToken,
      emailTokenExpiry: { $gt: Date.now() },
   });

   if (!user) {
      throw new ApiError(401, "Invalid or token expired");
   }

   user.isEmailVerified = true;
   user.emailVerificationToken = undefined;
   user.emailTokenExpiry = null;

   await user.save();

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            user.isEmailVerified,
            "Email Verified successfully",
         ),
      );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

   if (!incomingRefreshToken) {
      throw new ApiResponse(400, "Invalid refresh token");
   }

   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET,
      );

      const user = await User.findById(decodedToken._id);
      if (!user) {
         throw new ApiError(400, "invalid refresh token");
      }

      if (incomingRefreshToken !== user.refreshToken) {
         throw new ApiError(400, "refresh token is expired");
      }

      const { accessToken, refreshToken: newRefreshToken } =
         await generateAccessAndRefreshToken(user._id);

      user.refreshToken = newRefreshToken;

      const cookieOptions = {
         httpOnly: true,
         secure: true,
      };

      return;
      res.status(200)
         .cookie("accessToken", accessToken, cookieOptions)
         .cookie("refreshToken", newRefreshToken, cookieOptions)
         .json(new ApiResponse(200, {}, "Access token refresh successfully"));
   } catch (error) {
      throw new ApiError(400, "Invalid refresh token");
   }
});

const resendEmailVerification = asyncHandler(async (req, res) => {
   const user = await User.findById(req.user?._id);
   if (!user) {
      throw new ApiError(400, "User does not exist");
   }

   if (user.isEmailVerified) {
      throw new ApiError(409, "User already verified");
   }

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

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            { user: emailVerificationToken },
            "verification token send successfully",
         ),
      );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
   const { oldPassword, newPassword } = req.body;

   const user = await User.findById(req.user?._id);
   if (!user) {
      throw new ApiError(400, "User does not exists");
   }

   const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

   if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid password");
   }

   user.password = newPassword;
   await user.save({ validateBeforeSave: false });

   return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
   const { email } = req.body;

   const user = await User.findOne({ email });

   if (!user) {
      throw new ApiError(400, "User does not exist");
   }

   const { unhashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryTokens();

   user.forgotPasswordToken = hashedToken;
   user.forgotPasswordExpiry = tokenExpiry;

   await user.save({ validateBeforeSave: false });

   sendEmail({
      email: user?.email,
      subject: "verify your email",
      mailgenContent: forgotPasswordMailgenContent(
         user.username,
         `${req.protocol}://${req.get("host")}forgot-password/${unhashedToken}`,
      ),
   });

   return res
      .status(200)
      .json(new ApiResponse(200, {}, "forgot password mail send successfully"));
});

const resetForgotPassword = asyncHandler(async (req, res) => {
   const { resetToken } = req.params;
   const { newPassword } = req.body;

   const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

   const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: { $gt: Date.now() },
   });

   if (!user) {
      throw new ApiError(400, "Invalid token or expired token");
   }

   user.forgotPasswordExpiry = null;
   user.forgotPasswordToken = null;

   user.password = newPassword;
   await user.save({ validateBeforeSave: false });

   return res
      .status(200)
      .json(new ApiResponse(200, {}, "Forgot password reset successfully"));
});

export {
   registerUser,
   login,
   logout,
   getCurrentUser,
   refreshAccessToken,
   resendEmailVerification,
   verifyEmail,
   changeCurrentPassword,
   forgotPassword,
   resetForgotPassword,
};
