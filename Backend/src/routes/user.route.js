import { Router } from "express";
import { bankDetails, documents, findUser, login, signup, updatePassword, updateUser, userHistory } from "../controllers/user.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/sign-up").post(signup)
router.route("/login").post(login)
router.route("/current-user").get(verifyJWT, findUser)
router.route("/update-profile").patch(verifyJWT, updateUser)
router.route("/update-password").patch(verifyJWT, updatePassword)
router.route("/documents").post(
    verifyJWT,
    upload.fields([{ name: "aadharFrontImage", maxCount: 1 }, { name: "aadharBackImage", maxCount: 1 }]),
    documents
)
router.route("/bank-details").post(verifyJWT, bankDetails)
router.route("/history").get(verifyJWT, userHistory)

export default router