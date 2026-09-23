import { Router } from "express";
import { login, registerUser } from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { userLoginValidation, userRegisterValidation } from "../validators/index.js";

const router = Router();

router
   .route("/register")
   .post(userRegisterValidation(), validate, registerUser);

router.route("/login").post(userLoginValidation(), validate, login);

export default router;
