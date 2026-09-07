import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new Schema(
   {
      avatar: {
         type: {
            url: String,
            localPath: String,
         },
         default: {
            url: "",
            localPath: "",
         },
      },
      username: {
         type: String,
         required: true,
         trim: true,
         lowercase: true,
         unique: true,
         index: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
      },
      fullname: {
         type: String,
         required: true,
      },
      refreshToken: {
         type: String,
      },
      password: {
         type: String,
         required: [true, "password is required"],
      },
      isEmailVerified: {
         type: Boolean,
         default: false,
      },
      forgotPasswordToken: {
         type: String,
      },
      forgotPasswordExpiry: {
         type: Date,
      },
      emailVerificationToken: {
         type: String,
      },
      emailVerificationExpiry: {
         type: Date,
      },
   },
   {
      timestamps: true,
   },
);

userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next()
   this.password = bcrypt.hash(this.password, 10)
   next()
})

export const User = mongoose.model("User", userSchema)
