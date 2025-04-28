import mongoose from "mongoose";

const parkingSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    parkingName: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    location: {
        latitude: {
            type: String,
        },
        longitude: {
            type: String,
        }
    },
    vehicleTypes: {
        "2-wheeler": {
            type: Boolean
        },
        "4-wheeler": {
            type: Boolean
        },
        "heavy-vehicle": {
            type: Boolean
        }
    },
    hourlyRates: {
        "2-wheeler": {
            type: Number
        },
        "4-wheeler": {
            type: Number
        },
        "heavy-vehicle": {
            type: Number
        }
    },
    monthlyService: {
        type: Boolean,
    },
    monthlyRates: {
        "2-wheeler": {
            type: Number
        },
        "4-wheeler": {
            type: Number
        },
        "heavy-vehicle": {
            type: Number
        }
    },
    security: {
        type: Boolean
    },
    status: {
        type: String,
        enum: ["open", "close"],
        default: "close"
    },
    verification: {
        type: String,
        enum: ["process-2", "process-3", "process-4", "completed"],
    },
    parkingHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    }]
}, { timestamps: true })

export const Parking = mongoose.model("Parking", parkingSchema)