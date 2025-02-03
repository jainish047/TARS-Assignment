import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL; // Mongo URL (Atlas or local)

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(MONGODB_URL, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // deprecated
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
};

export default connectDB;