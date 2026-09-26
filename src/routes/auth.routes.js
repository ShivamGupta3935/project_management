import { Router } from "express";
import { login, logout, registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userLoginValidation, userRegisterValidation } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router
   .route("/register")
   .post(userRegisterValidation(), validate, registerUser);

router.route("/login").post(userLoginValidation(), validate, login);

router.route("/logout").post(verifyJWT, logout);

export default router;
