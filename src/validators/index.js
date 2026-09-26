import { body } from "express-validator";

const userRegisterValidation = () => {
   return [
      body("email")
         .trim()
         .toLowerCase()
         .notEmpty()
         .withMessage("email is required")
         .bail() //break the validation chain if above any method fail
         .isEmail()
         .withMessage("Invalid email"),
      body("username")
         .trim()
         .notEmpty()
         .withMessage("username is required")
         .bail() //break the validation chain
         .isLowercase()
         .withMessage("username must be lowercase")
         .bail()
         .isLength({ min: 3, max: 25 })
         .withMessage("username must be 3 to 25 chars long")
         .bail()
         .matches(/^[a-z0-9_]+$/)
         .withMessage(
            "Username can only contain letters, numbers and underscore",
         ),
      body("password")
         .notEmpty()
         .withMessage("password is required")
         .bail()
         .isLength({ min: 8, max: 64 })
         .withMessage("password must be 8 to 64 chars long"),
      body("fullname")
         .optional({ values: "falsy" })
         .trim()
         .isLength({ min: 5, max: 30 })
         .withMessage("fullname must be between 5 to 30 chars long"),
   ];
};

const userLoginValidation = () => {
   return [
      body("email")
         .optional()
         .trim()
         .toLowerCase()
         .notEmpty()
         .withMessage("email is required")
         .bail()
         .isEmail()
         .withMessage("Invalid email"),
      body("username")
         .optional()
         .trim()
         .notEmpty()
         .withMessage("username is required")
         .bail()
         .isLowercase()
         .withMessage("invalid username"),
   ];
};

const userGetCurrentPasswordValidator = () => {
   return [
      body("oldPassword").notEmpty().withMessage("oldPassword is required"),
      body("newPassword")
         .notEmpty()
         .withMessage("New password is required")
         .bail()
         .isLength({ min: 8, max: 64 })
         .withMessage("password must be between 8 to 64"),
   ];
};

const userCurrentPasswordValidator = () => {
   return [
      body("email")
         .notEmpty()
         .withMessage("Email is required")
         .bail()
         .isEmail()
         .withMessage("Invalid email format"),
   ];
};

const userForgetPasswordRequestValidator = () => {
   return[
      body("email")
        .notEmpty()
        .withMessage("email is required")
        .bail()
        .isEmail()
        .withMessage("Email is invalid")
   ]
}

const userResetForgetPasswordValidator = () => {
   return [
      body("newPassword")
         .notEmpty()
         .withMessage("Password is required")
         .bail()
         .isLength({ min: 8, max: 64 })
         .withMessage("New password must be between 8 to 64"),
   ];
};

export {
   userRegisterValidation,
   userLoginValidation,
   userGetCurrentPasswordValidator,
   userCurrentPasswordValidator,
   userResetForgetPasswordValidator,
   userForgetPasswordRequestValidator
};
