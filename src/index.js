import dotenv from "dotenv";
import express from "express";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
   path: "./.env",
});

const port = process.env.PORT || 3333;

connectDB()
   .then(() => {
      app.listen(process.env.PORT, () => {
         console.log(`app is listening on port: ${port}`);
      });
   })
   .catch(() => {
      console.error("Db connection failed");
      process.exit(1);
   });
