import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import projectRoutes from "./src/routes/projectRoutes.js"
import userRoutes from "./src/routes/userRoutes.js"
import techRoutes from "./src/routes/techRoutes.js"
import linkRoutes from "./src/routes/linkRoutes.js"
import socialsRoutes from "./src/routes/socialsRoutes.js"
import skillRoutes from "./src/routes/skillRoutes.js"
import personalInfoRoutes from "./src/routes/personalInfoRoutes.js"
import { connectDB } from "./config/db.js"
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SERVER_PORT = process.env.SERVER_PORT || 5001;
const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tech", techRoutes);
app.use("/api/socials", socialsRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/personal-info", personalInfoRoutes);
app.listen(SERVER_PORT);