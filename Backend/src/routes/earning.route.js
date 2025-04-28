import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { saveOwnerEarnings } from "../controllers/earning.controller.js";

const router = Router();

router.route("/todays-earning").get(verifyJWT, saveOwnerEarnings)

export default router;