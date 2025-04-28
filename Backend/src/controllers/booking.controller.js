import { Booking } from "../models/booking.model.js";
import { Parking } from "../models/parking.model.js";

const createBooking = async (req, res) => {
    const user = req.user
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const { parkingId, vehicleType, vehicleNumber, duration } = req.body
    if (!vehicleType || !vehicleNumber) {
        return res.status(401).json({ message: "Vehicle type and number are required" })
    }

    const parking = await Parking.findById(parkingId)
    if (!parking) {
        return res.status(404).json({ message: "Parking not found" })
    }

    if (!parking.vehicleTypes[vehicleType]) {
        return res.status(401).json({ message: "Selected vehicle is not allowed in the parking" })
    }

    const bookingData = {
        user,
        parking,
        owner: parking.owner,
        vehicleType,
        vehicleNumber
    }

    if (parking.security) {
        bookingData.entryToken = Math.floor(1000 + Math.random() * 9000);
        bookingData.exitToken = Math.floor(1000 + Math.random() * 9000);
    }
    else {
        if (!duration) {
            return res.status(400).json({ message: "Parking duration is required" })
        }
        bookingData.duration = duration;
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
        bookingData.startTime = startTime;
        bookingData.endTime = endTime;
        bookingData.status = "completed";

        const hourlyRate = parking.hourlyRates[vehicleType]
        if (!hourlyRate) {
            return res.status(404).json({ message: "Rates not found" })
        }
        const parkingAmount = hourlyRate * duration
        const platformFees = parkingAmount * 0.1
        const totalAmount = platformFees + parkingAmount

        bookingData.bill = {
            parkingAmount,
            platformFees,
            totalAmount
        }
    }

    const booking = await Booking.create(bookingData);

    user.bookingHistory.push(booking._id)
    await user.save()

    parking.parkingHistory.push(booking._id)
    await parking.save()

    return res.status(200).json({ message: "Parking booked sucessfully", success: true, booking })
}

export { createBooking }