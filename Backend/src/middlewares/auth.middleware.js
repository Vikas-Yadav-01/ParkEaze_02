import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            return res.status(400).json({ message: "Unauthorizied request" })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!decodedToken) {
            return res.status(400).json({ message: "wrong token" })
        }

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            return res.status(500).json({ message: "User not found" })
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json(error?.message || "Invalid access token")
    }
}

export default verifyJWT