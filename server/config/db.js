import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("CONNECTED TO MONGODB");
    }
    catch( error) {
        console.error("Failed to connect to MongoDB");
    }
}