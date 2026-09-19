import express from "express";
import cors from "cors"
import { healthcheckRoute } from "./controllers/healthcheck.controllers.js";
import authRouter from "./routes/auth.routes.js"

const app = express();

//basic express configuration setup
app.use(express.urlencoded({ extended: true })); //for url encoding data
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));

//cors configuration
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    methods: ["GET", "PUT", "POST", "PATCH", "OPTIONS", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"]
}))


// route import 
app.use("/api/v1/healthcheck", healthcheckRoute)
app.use("/api/v1/auth", authRouter)

app.get("/", (req, res) => {
   res.send("app is listening");
});

export default app;
