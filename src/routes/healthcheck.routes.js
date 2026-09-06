import { Router } from "express";
import { healthcheckRoute } from "../controllers/healthcheck.controllers.js";

const router = Router()

router.route("/").get(healthcheckRoute)


export default router;