import jwt from "jsonwebtoken";

 const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.authToken; // Extract token from cookies
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next();
  } catch (err) {
    console.error("Authentication Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export default authMiddleware;
