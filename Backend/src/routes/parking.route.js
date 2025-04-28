import { Router } from "express";
import { entryToken, exitToken, fetchUsersParking, findParking, parkingHistory, parkingInfo, parkingSetup } from "../controllers/parking.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/create-parking").post(verifyJWT, parkingSetup)
router.route("/parking-setup").post(verifyJWT, parkingInfo)
router.route("/entry-token").post(verifyJWT, entryToken)
router.route("/exit-token").post(verifyJWT, exitToken)
router.route("/history").get(verifyJWT, parkingHistory)
router.route("/find-parking").get(verifyJWT, findParking)
router.route("/parking").get(verifyJWT, fetchUsersParking)

export default router