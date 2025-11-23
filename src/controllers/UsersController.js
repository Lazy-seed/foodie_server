import User from "../models/User.js";
import generateTokens from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../services/emailService.js";
import crypto from "crypto";

// Helper for cookie options
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // Only secure in production (HTTPS)
    sameSite: isProd ? "None" : "Lax", // None for production, Lax for development
    maxAge: 15 * 60 * 1000, // 15 minutes
  };
};

const getRefreshCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

// Login Controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, getCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
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

    const newUser = new User({ name, email, password });
    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.cookie("accessToken", accessToken, getCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.status(201).json({
      message: "User created successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      accessToken,
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout Controller
export const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: isProd ? "None" : "Lax",
      secure: isProd
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: isProd ? "None" : "Lax",
      secure: isProd
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Refresh Token Controller
export const refreshController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

      user.refreshToken = newRefreshToken;
      user.save();

      res.cookie("accessToken", accessToken, getCookieOptions());
      res.cookie("refreshToken", newRefreshToken, getRefreshCookieOptions());

      // Return both user and accessToken for Redux state restoration
      res.json({
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.error("Refresh Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get User Info Controller
export const getLoggedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
      message: "User information retrieved successfully.",
      user,
    });
  } catch (err) {
    console.error("Get User Info Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail(user.email, "Password Reset Request", message);
      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: "Password Reset Success",
    });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
