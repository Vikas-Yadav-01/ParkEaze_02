import mongoose from "mongoose";

const earningSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    date: {
        type: Date,
        required: true
    },
    booking: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    }],
    dayEarning: {
        type: Number
    },
    appCommision: {
        type: Number
    },
    totalEarning: {
        type: Number
    }
}, { timestamps: true })

export const Earning = mongoose.model("Earning", earningSchema)