import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    parking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parking"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    vehicleType: {
        type: String,
        enum: ["2-wheeler", "4-wheeler", "heavy-vehicle"]
    },
    vehicleNumber: {
        type: String
    },
    entryToken: {
        type: Number
    },
    exitToken: {
        type: Number
    },
    duration: {
        type: Number
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    bill: {
        parkingAmount: {
            type: Number
        },
        platformFees: {
            type: Number
        },
        totalAmount: {
            type: Number
        }
    },
    status: {
        type: String,
        enum: ["active", "completed"],
        default: "active"
    }
}, { timestamps: true })

export const Booking = mongoose.model("Booking", bookingSchema)