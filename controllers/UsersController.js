import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Import the User model


// Login Controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.password !== password) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1day" });
    // Set token in HTTP-only cookie
    res.cookie("authToken", token, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "None", // Prevent CSRF
      maxAge: 36000000, // Cookie expires in 1 hour
    });

    return res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Signup Controller
export const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, password: password });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1day" });
    // Set token in HTTP-only cookie
    res.cookie("authToken", token, {
      // httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "None", // Prevent CSRF
      maxAge: 36000000, // Cookie expires in 1 hour
    });
    return res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get User Info Controller
export const getLoggedUser = async (req, res) => {
  try {
 console.log(req.user)

    // Verify and decode the token
    const decoded = req.user
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    // Fetch user details, excluding the password field
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Send the user data in response
    return res.status(200).json({
      message: "User information retrieved successfully.",
      user,
    });
  } catch (err) {
    console.error("Get User Info Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
