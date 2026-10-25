import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60, // 1 hour
};

export async function loginUser(req, res) {
    try {
        const body = req.body || {};
        const username = typeof body.username === "string" ? body.username.trim() : "";
        const password = typeof body.password === "string" ? body.password : (body.password ? String(body.password) : "");

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password required",
            });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password).catch((err) => {
            console.error("Bcrypt comparison error:", err);
            return false;
        });

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured in environment variables.");
            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error",
            });
        }

        const token = jwt.sign(
            { user_id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, COOKIE_OPTIONS);
        return res.status(200).json({
            success: true,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error: " + (error.message || "Unknown error"),
        });
    }
}

export async function logoutUser(req, res) {
    try {
        res.clearCookie("token", COOKIE_OPTIONS);
        res.status(200).json({
            success: true,
            message: "Successfully logged out!"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
}
