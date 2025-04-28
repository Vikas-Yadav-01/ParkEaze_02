import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        enum: ["Book Parking", "Parking Owner"],
        default: "Book Parking"
    },
    documents: {
        aadharNumber: {
            type: String,
            trim: true
        },
        aadharFrontImage: {
            type: String
        },
        aadharBackImage: {
            type: String
        }
    },
    bankDetails: {
        bankName: {
            type: String
        },
        accountNumber: {
            type: String
        },
        ifscCode: {
            type: String
        }
    },
    bookingHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    }]
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("documents.aadharNumber")) return next();
    this.documents.aadharNumber = await bcrypt.hash(this.documents.aadharNumber, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY })
}

export const User = mongoose.model("User", userSchema)