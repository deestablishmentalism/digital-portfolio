import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Request not authenticated! You will be logged out."
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session. You will be logged out."
        });
    }
}