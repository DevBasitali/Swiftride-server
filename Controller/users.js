import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import signup from "../Model/signup.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import Status_Model from "../Model/showroomStatus.js";
import { urlencoded } from "express";

export const Signup = async (req, res) => {
  try {
    const {
      showroomName,
      ownerName,
      cnic,
      contactNumber,
      images,
      address,
      email,
      password,
      role,
    } = req.body;
    const errors = validationResult(req);
    console.log(req.body);
    console.log("image name is " + req.images);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    console.log("validation pass");
    console.log(errors);
    console.log(req.body.showroomName);

    let user = await signup.findOne({ email });

    if (showroomName) {
      const response = await signup.findOne({ showroomName }); // Check for existing showroom
      if (response) {
        return res.status(400).json("Showroom with this name already exists");
      }
    }
    if (user) {
      return res.status(400).json("User already exists"); // If user exists, return this message
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create a new user (showroomOwner or client)
    user = new signup({
      showroomName,
      ownerName,
      cnic,
      contactNumber,
      address,
      email,
      images,
      password: hashedPassword,
      role,
    });

    console.log(hashedPassword);

    await user.save();
    if (role === "showroom") {
      const showroomStatus = new Status_Model({
        showroomId: user._id, // Link the showroom to the user by ID
        status: "active", // Set the status as active
        approved: 0, // Set the showroom as pending approval
      });

      // Save the showroom status
      await showroomStatus.save();
    }

    // Respond based on the user role
    if (role === "client") {
      return res.status(201).json("User registered successfully");
    }
    if (role === "showroom") {
      return res
        .status(201)
        .json("Showroom registered successfully, awaiting approval");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await signup.findOne({ email });
    if (!user) {
      return res.status(400).json("User with this email does not exist");
    }

    // Logic for admin login
    if (user.role === "admin") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json("Invalid email or password");

      // Generate token for admin
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.SECRET_KEY,
        {
          expiresIn: "10h",
        }
      );
      res.cookie("auth_token", token);
      return res
        .status(200)
        .json({ message: "Login successful", role: user.role });
    }

    // Logic for showroom users
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid password");

    // Find the showroom status
    let showroomStatus = null;
    if (user.role === "showroom") {
      showroomStatus = await Status_Model.findOne({ showroomId: user._id });
    }
    let name;
    if (user.role === "client") name = user.ownerName;

    // If the showroom status is not found or it's banned, deny access
    if (user.role === "showroom") {
      name = user.showroomName;
      if (!showroomStatus) {
        return res.status(200).json("Showroom status not found.");
      }

      if (showroomStatus.status === "baned") {
        return res.status(200).json("Your showroom is banned.");
      }

      if (showroomStatus.approved !== 1) {
        return res.status(200).json("Your showroom is awaiting approval.");
      }
    }

    // Generate token for showroom or client
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    // Send the token and relevant info
    res.cookie("auth_token", token);
    console.log(name);
    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      approved: showroomStatus ? showroomStatus.approved : null,
      status: showroomStatus ? showroomStatus.status : null,
      name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
};

// logout controller
export const logout = async (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.status(200).json({ message: "Logout sucessfully" });
};
// Forgot Password Logic
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await signup.findOne({ email }); // Ensure you use the correct model

    if (!user) return res.status(404).json("User not found test");

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex"); // Generate a random reset token
    user.resetPasswordToken = resetToken; // Store the plain token in the database
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    await user.save();

    // Send reset link via email
    const resetUrl = `${process.env.SITE_URL}/reset-password/${resetToken}`;
    const message = `Please click on the following link to reset your password: ${resetUrl}`;

    const transporter = nodemailer.createTransport({
      service: user,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      text: message,
    });

    res.status(200).json("Email sent");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password Logic
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json("Passwords do not match");
    }

    // Hash the new password before saving it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    // Find user by reset token
    const user = await signup.findOne({
      resetPasswordToken: token, // Assuming token is stored as plain in the database
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json("Invalid or expired token");
    }

    // Update user's password and reset token fields
    user.password = hashedPassword; // Set the hashed password
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpires = undefined; // Clear expiration time
    await user.save();

    res.status(200).json("Password updated successfully");
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//   this is just for testing purpose
export const test = (req, res) => {
  res
    .status(200)
    .json({
      message: "Access granted",
      userId: req.user,
      role: req.role || "NO ROLE",
    });
};
