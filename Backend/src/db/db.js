import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`Database connected sucessfully ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(1)
    }
}

export default connectDB