import mongoose from "mongoose";
const Admin_Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
});
const Admin_Model = mongoose.model("Adminlogin", Admin_Schema);

export default Admin_Model;
