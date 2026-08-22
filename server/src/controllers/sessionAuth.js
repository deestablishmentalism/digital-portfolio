
export function requireAuth(req, res, next) {
    if(!req.session.logged_in && !req.session.user_id) {
        return res.status(401).json({
            success: false,
            message: "Request not authenticated! You will be logged out."
        });
    }
    next();
}