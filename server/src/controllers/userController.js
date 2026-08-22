import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import session from "express-session";

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
        req.session.regenerate(err=> {
            if(err) throw new Error("Logging in failed");
            req.session.user_id=user._id;
            req.session.logged_in=true;
            res.status(200).json({ success: true, message: "Login successful" });
        })
    } 
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export async function logoutUser(req,res) {
    try {
        req.session.destroy(err=> {
            if(err) throw new Error("Failed to logout!")
            res.clearCookie("connect.sid")
            res.status(200).json({
                success: true,
                message: "Successfully logged out!"
            })
        })
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: "+ error.message
        })
    }
}
