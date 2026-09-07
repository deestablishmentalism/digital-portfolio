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
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password required" });
        }
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { user_id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.cookie("token", token, COOKIE_OPTIONS);
        res.status(200).json({ success: true, message: "Login successful" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
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
