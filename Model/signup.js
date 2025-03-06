
import mongoose from "mongoose";
const schema=mongoose.Schema;
// const userSignup =new schema(
//     {
//         name:{
//             type:String,
//             required:true
//         },
//         email:{
//             type:String,
//             required:true,
//             unique:true
//         },
//         cnic:{
//             type:Number,
//             required:true
//         },
//         contactNumber:{
//             type:Number,
//             required:true,

//         },
//         address:{
//             type:String,
//             required:true
//         },
//         password:{
//             type:String,
//             required:true
//         },
//         role:{
//             type:String,
//             required:true,
//             default:'user'
//         }

//     },{timestamps:true}
// );
// const UserSignup=mongoose.model('userSignup',userSignup);
// UserSignup.createIndexes();
// // module.exports=Signup;
// export default UserSignup;



// const mongoose = require('mongoose');

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
  { timestamps: true }
);

const signup = mongoose.model('Users_data', Signup);
signup.createIndexes();
export default signup;
