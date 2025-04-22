import mongoose from "mongoose";

const Status = new mongoose.Schema({
  showroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users_data",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "banned", "inactive"],
    default: "inactive",
  },
  approved: { type: Number, enum: [0, 1], default: 0 },
});
if (mongoose.models.Showroomstatuses) {
  delete mongoose.models.Showroomstatuses;
}

const Status_Model = mongoose.model("Showroomstatuses", Status);

export default Status_Model;
