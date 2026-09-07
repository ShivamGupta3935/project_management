import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"

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
   if (!this.isModified("password")) return next();
   this.password = bcrypt.hash(this.password, 10);
   next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
      {
         _id: this._id,
         email: this.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn: process.env.ACCESS_TOKEN_EXPITY,
      },
   );
};

userSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
      {
         _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
         expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      },
   );
};

userSchema.methods.generateTemporaryTokens = function(){
   const unhashedToken = crypto.randomBytes(20).toString()
   const hashedToken = crypto.createHash("sha256").hash(unhashedToken).update("hex").digest()
   const tokenExpiry = Date.now() + (20*60*1000)

   return{unhashedToken, hashedToken, tokenExpiry}
}

export const User = mongoose.model("User", userSchema);
