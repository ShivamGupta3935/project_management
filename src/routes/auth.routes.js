import { Router } from "express";
import {
   changeCurrentPassword,
   forgotPasswordRequest,
   getCurrentUser,
   login,
   logout,
   refreshAccessToken,
   registerUser,
   resendEmailVerification,
   resetForgotPassword,
   verifyEmail,
} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
   userCurrentPasswordValidator,
   userForgetPasswordRequestValidator,
   userLoginValidation,
   userRegisterValidation,
   userResetForgetPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//unsecure route
router
   .route("/register")
   .post(userRegisterValidation(), validate, registerUser);

router.route("/login").post(userLoginValidation(), validate, login);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-access-token").get(refreshAccessToken);

router
   .route("/forgot-password-request")
   .post(userForgetPasswordRequestValidator(), validate, forgotPasswordRequest);

router
   .route("/reset-forgot-password")
   .post(userResetForgetPasswordValidator(), validate, resetForgotPassword);

//secure route
router.route("/logout").post(verifyJWT, logout);

router.route("/current-user").post(verifyJWT, getCurrentUser);

router
   .route("/resend-email-verification")
   .post(verifyJWT, resendEmailVerification);

router
   .route("/change-current-password")
   .post(
      verifyJWT,
      userCurrentPasswordValidator(),
      validate,
      changeCurrentPassword,
   );

export default router;
