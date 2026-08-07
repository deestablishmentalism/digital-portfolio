import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "./src/models/project.js";
import bcrypt from "bcrypt"

dotenv.config();
/**
 * Function to seed an admin user
 */
async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const existing = await User.findOne({});
        if (existing) {
            console.log("A user already exists cannot seed");
            await mongoose.disconnect();
        }
        else {
            //put desired username here
            existing.username = "";
            const saltRounds = 10;
            existing.password = bcrypt.hash("",saltRounds);
            //put password here ------------^^
            await mongoose.save()
            console.log("New user seeded");
            await mongoose.disconnect();
        }
        
    } catch (error) {
        console.error("Seed failed:", error);
        process.exit(1);
    }
}

seed();
