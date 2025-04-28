import { Parking } from "../models/parking.model.js";
import { Booking } from "../models/booking.model.js";

const parkingSetup = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    if (user.role !== "Parking Owner") {
        return res.status(402).json({ message: "User is not authorized to update parking details" })
    }

    const { owner, parkingName, address, latitude, longitude } = req.body
    if (!parkingName || !address || !latitude || !longitude) {
        return res.status(401).json({ message: "Every feilds are required" })
    }

    const parking = await Parking.findOneAndUpdate(
        { owner: user._id },
        {
            owner: req.user._id,
            parkingName,
            address,
            location: {
                latitude,
                longitude
            },
            verification: "process-2"
        },
        { upsert: true, new: true }
    )
    if (!parking) {
        return res.status(501).json({ message: "Parking was unable to create" })
    }

    res.status(200).json({ message: "Parking credential completed", parking })
}

const parkingInfo = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "Parking Owner") {
        return res.status(402).json({ message: "User is not authorized to update parking details" });
    }

    const { vehicleTypes, hourlyRates, monthlyService, monthlyRates, security } = req.body;
    if (!vehicleTypes || !hourlyRates || !monthlyService || !monthlyRates || !security) {
        return res.status(402).json({ message: "Every feilds are required" });
    }

    const updateData = {
        vehicleTypes,
        hourlyRates,
        monthlyService,
        monthlyRates,
        security,
        verification: "process-3"
    };

    const updatedParking = await Parking.findOneAndUpdate(
        { owner: user._id },
        { $set: updateData },
        { new: true }
    );
    if (!updatedParking) {
        return res.status(404).json({ message: "Parking record not found for this owner" });
    }

    res.status(200).json({
        message: "Parking details updated successfully",
        parking: updatedParking
    });
};

const entryToken = async (req, res) => {
    const { entryToken } = req.body
    if (!entryToken) {
        return res.status(401).json({ message: "Entry token is required" })
    }

    const booking = await Booking.findOne({ entryToken })
    if (!booking) {
        return res.status(401).json({ message: "Wrong entry token" })
    }
    if (booking.startTime) {
        return res.status(400).json({ message: "Entry time has already been recorded" });
    }
    booking.startTime = new Date();
    booking.status = "active"
    await booking.save();

    res.status(200).json({ message: "Entry time recorded", success: true, booking });
}

const exitToken = async (req, res) => {
    const { exitToken } = req.body
    if (!exitToken) {
        return res.status(400).json({ messasge: "Exit token is required" })
    }

    const booking = await Booking.findOne({ exitToken })
    if (!booking) {
        return res.status(400).json({ messasge: "Wrong exit token" })
    }
    if (booking.endTime) {
        return res.status(400).json({ message: "Exit time has already been recorded" });
    }
    if (!booking.startTime) {
        return res.status(400).json({ message: "Cannot record exit before entry" });
    }

    booking.endTime = new Date();
    booking.status = "completed";

    const durationHours = (booking.endTime - booking.startTime) / (1000 * 60 * 60);
    booking.duration = durationHours;

    const parking = await Parking.findOne({ owner: booking.owner });
    if (!parking) {
        return res.status(404).json({ message: "Parking not found" });
    }

    const hourlyRate = parking.hourlyRates[booking.vehicleType];
    if (!hourlyRate) {
        return res.status(400).json({ message: `Hourly rate not set for ${booking.vehicleType}` });
    }

    const parkingAmount = hourlyRate * durationHours;
    const platformFees = parkingAmount * 0.1;
    const totalAmount = parkingAmount + platformFees;

    booking.bill = {
        parkingAmount,
        platformFees,
        totalAmount,
    };

    await booking.save();

    res.status(200).json({ message: "Thanks for parking", success: true, booking })
}

const parkingHistory = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const history = await Parking.findOne({ owner: user._id }).populate("parkingHistory")
    if (!history) {
        return res.status(401).json({ message: "Create Your Parking First" });
    }
    if (history.parkingHistory.length === 0) {
        return res.status(200).json({ message: "No Parking History Available" });
    }

    res.status(201).json({
        success: true,
        message: "Parking history found",
        History: history.parkingHistory
    });
}

const findParking = async (req, res) => {
    const parkings = await Parking.find({})

    res.status(200).json({ message: "Parking found", success: true, parkings })
}

const fetchUsersParking = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const parking = await Parking.findOne({ owner: user._id }).populate("parkingHistory")
    if (!parking) {
        return res.status(400).json({ message: "Parking not found" })
    }

    res.status(200).json({
        success: true,
        message: "Owner's parking found",
        parking
    })
}

export {
    parkingSetup,
    parkingInfo,
    entryToken,
    exitToken,
    parkingHistory,
    findParking,
    fetchUsersParking
}