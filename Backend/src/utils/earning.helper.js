import { Booking } from "../models/booking.model.js";

const getTodaysEarning = async (ownerId, startOfDay, endOfDay) => {
    const result = await Booking.aggregate([
        {
            $match: {
                owner: ownerId,
                status: "completed",
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                "bill.totalAmount": { $exists: true }
            }
        },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                dayEarning: { $sum: "$bill.totalAmount" },
                appCommision: { $sum: "$bill.platformFees" }
            }
        },
        {
            $addFields: {
                totalEarning: { $subtract: ["$dayEarning", "$appCommision"] }
            }
        }
    ]);

    return result[0] || {
        totalBookings: 0,
        dayEarning: 0,
        appCommision: 0,
        totalEarning: 0
    };
}

export { getTodaysEarning }