// Admin middleware - checks if user has admin role
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            message: 'Access denied. Admin privileges required.'
        });
    }
};
