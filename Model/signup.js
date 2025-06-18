import mongoose from "mongoose";

const Signup = new mongoose.Schema(
  {
    showroomName: { type: String, sparse: true, unique: true },
    ownerName: { type: String },
    cnic: { type: String },
    contactNumber: { type: String },
    address: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "showroom", "client"],
      required: true,
    },
    images: [{ type: String }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true },
);

const signup = mongoose.model("Users", Signup);
signup.createIndexes();
export default signup;
