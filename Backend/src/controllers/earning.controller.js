import { Earning } from "../models/earning.model.js";
import { getTodaysEarning } from "../utils/earning.helper.js";

const saveOwnerEarnings = async (req, res) => {
  try {
    const owner = req.user;
    if (!owner) {
      return res.status(404).json({ message: "User not found" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const earningsData = await getTodaysEarning(owner._id, startOfDay, endOfDay);

    const updatedEarnings = await Earning.findOneAndUpdate(
      { owner: owner._id, date: startOfDay },
      {
        owner: owner._id,
        date: startOfDay,
        booking: [],
        dayEarning: earningsData.dayEarning,
        appCommision: earningsData.appCommision,
        totalEarning: earningsData.totalEarning
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Owner earnings saved successfully",
      earnings: updatedEarnings
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving owner earnings", error: error.message });
  }
};

export { saveOwnerEarnings };