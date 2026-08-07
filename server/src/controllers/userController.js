import bcrypt from "bcrypt";
import { User } from "../models/user.js";

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
        res.status(200).json({ success: true, message: "Login successful" });
    } catch (error) {
        console.error(`Error in loginUser: ${error.message}`);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
