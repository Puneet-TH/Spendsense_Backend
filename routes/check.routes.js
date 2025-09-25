import { Check } from "../controllers/ServerCheck.controller.js";
import { Router } from "express";

const router = Router()

router.route("/").get(Check)

export default router