import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js";
import parkingRouter from "./routes/parking.route.js";
import bookingRouter from "./routes/booking.route.js";
import earningRouter from "./routes/earning.route.js";

app.use("/users", userRouter)
app.use("/parkings", parkingRouter)
app.use("/bookings", bookingRouter)
app.use("/earnings", earningRouter)

export default app