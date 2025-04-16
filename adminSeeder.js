import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import signup from "./Model/signup.js";
import dotenv from "dotenv";

dotenv.config();
// Function to create the admin user
const createAdminUser = async () => {
  try {
    const adminExists = await signup.findOne({ email: "admin@gmail.com" });
    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("12345678", salt);

    // Create the admin user
    const adminUser = new signup({
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Connect to MongoDB and create the admin user
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    createAdminUser();
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
