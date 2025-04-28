import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Parking } from "../models/parking.model.js";

const signup = async (req, res) => {
    const { userName, phoneNumber, password, role } = req.body
    if (!userName || !phoneNumber || !password || !role) {
        return res.status(400).json({ message: "Every fields are required" })
    }
    if (role !== "Book Parking" && role !== "Parking Owner") {
        return res.status(400).json({ message: "You cannot proceed with this role" })
    }

    const existedUser = await User.findOne({ phoneNumber })
    if (existedUser) {
        return res.status(401).json({ message: "User already exist" })
    }

    const user = await User.create({
        userName,
        phoneNumber,
        password,
        role
    })
    if (!user) {
        return res.status(501).json({ message: "Something went wrong" })
    }

    const token = await user.generateToken(user._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(201)
        .cookie("token", token, options)
        .json({ message: "User created sucessfully", success: true, user, token })
}

const login = async (req, res) => {
    const { phoneNumber, password } = req.body
    if (!phoneNumber || !password) {
        return res.status(400).json({ message: "Every fields are required" })
    }

    const user = await User.findOne({ phoneNumber })
    if (!user) {
        return res.status(401).json({ message: "User does not exist" })
    }

    const checkPassword = await user.isPasswordCorrect(password)
    if (!checkPassword) {
        return res.status(400).json({ message: "Password incorrect" })
    }

    const token = await user.generateToken(user._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .cookie("token", token, options)
        .json({ message: "User logged In", success: true, user, token })
}

const findUser = async (req, res) => {
    const user = req.user
    res.status(201).json({ message: "User found", success: true, user })
}

const updateUser = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const { userName, phoneNumber, role } = req.body;

    if (userName) user.userName = userName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({ message: "User updated successfully", success: true, user });
};

const updatePassword = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const { oldPassword, newPassword, confirmPassword } = req.body
    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(401).json({ message: "Every feilds are required" })
    }

    const checkPassword = await user.isPasswordCorrect(oldPassword)
    if (!checkPassword) {
        return res.status(401).json({ message: "Wrong password" })
    }

    if (newPassword !== confirmPassword) {
        return res.status(404).json({ message: "New password and confirm password should be same" })
    }

    user.password = newPassword
    await user.save()

    return res.status(201).json({ message: "Password updated", success: true });
}

const documents = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const { aadharNumber } = req.body
    if (!aadharNumber) {
        return res.status(401).json({ message: "Aadhar number is required" })
    }

    const aadharFrontImageLocalPath = req.files?.aadharFrontImage[0]?.path;
    const aadharBackImageLocalPath = req.files?.aadharBackImage[0]?.path
    if (!aadharFrontImageLocalPath, !aadharBackImageLocalPath) {
        return res.status(401).json({ message: "Aadhar image is required" })
    }

    const aadharFrontImage = await uploadOnCloudinary(aadharFrontImageLocalPath)
    const aadharBackImage = await uploadOnCloudinary(aadharBackImageLocalPath)
    if (!aadharFrontImage || !aadharBackImage) {
        return res.status(400).json({ message: "Aadhar image file is required" })
    }

    user.documents.aadharNumber = aadharNumber
    user.documents.aadharFrontImage = aadharFrontImage.url
    user.documents.aadharBackImage = aadharBackImage.url
    await user.save()

    const parking = await Parking.findOne({ owner: user._id })
    if (!parking) {
        return res.status(404).json({ message: "Parking not found" })
    }

    parking.verification = "process-4"
    await parking.save()

    res.status(201).json({ message: "Document uploaded", user })
}

const bankDetails = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const { bankName, accountNumber, ifscCode } = req.body
    if (!bankName || !accountNumber || !ifscCode) {
        return res.status(401).json({ message: "Every fields are required" })
    }

    user.bankDetails.bankName = bankName,
        user.bankDetails.accountNumber = accountNumber,
        user.bankDetails.ifscCode = ifscCode
    await user.save()

    const parking = await Parking.findOne({ owner: user._id })
    if (!parking) {
        return res.status(404).json({ message: "Parking not found" })
    }

    parking.verification = "completed";
    await parking.save()

    res.status(201).json({ message: "Bank details submitted", success: true, user })
}

const userHistory = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const history = await User.findById(user._id).populate({
        path: "bookingHistory",
        populate: {
            path: "parking",
            model: "Parking"
        }
    })
    if (!history || history.bookingHistory.length === 0) {
        return res.status(200).json({ message: "No booking history available" });
    }

    res.status(201).json({
        success: true,
        message: "history found",
        History: history.bookingHistory
    })
}

export {
    signup,
    login,
    findUser,
    updateUser,
    updatePassword,
    documents,
    bankDetails,
    userHistory
};