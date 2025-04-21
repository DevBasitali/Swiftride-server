import User from "../models/signup.js";

export const checkExisting = async (req, res) => {
  try {
    const { email, contactNumber, cnic } = req.body;

    // Check if any field is empty
    if (!email || !contactNumber || !cnic) {
      return res.status(400).json({
        error: "Please provide all required fields (email, contactNumber, cnic)"
      });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        exists: true,
        field: "email",
        message: "Email already in use"
      });
    }

    // Check for existing contact number
    const existingContact = await User.findOne({ contactNumber });
    if (existingContact) {
      return res.status(409).json({
        exists: true,
        field: "contactNumber",
        message: "Contact number already in use"
      });
    }

    // Check for existing CNIC
    const existingCnic = await User.findOne({ cnic });
    if (existingCnic) {
      return res.status(409).json({
        exists: true,
        field: "cnic",
        message: "CNIC already registered"
      });
    }

    // If no duplicates found
    res.status(200).json({ exists: false });
  } catch (error) {
    console.error("Error checking existing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
