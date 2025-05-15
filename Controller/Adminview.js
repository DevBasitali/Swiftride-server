import Status_Model from "../Model/showroomStatus.js";
import signup from "../Model/signup.js";
export const Adminview = async (req, res) => {
  const Admin_view = await signup.aggregate([
    {
      $match: { role: { $in: ["showroom", "client"] } },
    },
    {
      $lookup: {
        from: "showroomstatuses", // name of the collection for the status model in lowercase
        localField: "_id",
        foreignField: "showroomId",
        as: "status",
      },
    },
    {
      $unwind: {
        path: "$status",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        showroomName: 1,
        ownerName: 1,
        cnic: 1,
        contactNumber: 1,
        address: 1,
        email: 1,
        password: 1,
        role: 1,
        images: 1,
        status: {
          $ifNull: ["$status.status", "active"],
        },
        isApproved: {
          $cond: {
            if: { $eq: ["$role", "showroom"] },
            then: { $ifNull: ["$status.approved", 0] },
            else: "$$REMOVE",
          },
        },
        createdAt: 1,
      },
    },
  ]);

  if (!Admin_view || Admin_view.length === 0) {
    return res.status(404).json({ msg: "No data found" });
  }
  const showroomData = [];
  const clientData = [];
  console.log(Array.isArray(Admin_view)); //just check for selfpurpose
  Admin_view.forEach((item) => {
    if (item.role === "showroom") {
      showroomData.push(item);
    } else if (item.role === "client") {
      clientData.push(item);
    }
  });
  //  console.log("showroomdata",showroomData)
  //  console.log("clientdata",clientData)
  res.json({
    showroomSection: showroomData,
    clientSection: clientData,
  });
};
export const BanShowroom = async (req, res) => {
  const { showroomid } = req.params;
  // console.log(showroomid)
  try {
    const showroom = await signup.findById(showroomid);
    // console.log(showroom)
    const exist_ban = await Status_Model.findOne({
      showroomId: showroomid,
    });
    if (exist_ban) {
      if (exist_ban?.status === "banned") {
        exist_ban.status = "active";
        await exist_ban.save();
        return res.status(200).json({ msg: "Activated successfully" });
      }

      if (exist_ban?.status === "active") {
        exist_ban.status = "banned";
        await exist_ban.save();
        return res.status(200).json({ msg: "Banned successfully" });
      }
    } else {
      const newStatus = new Status_Model({
        showroomId: showroomid,
        status: "banned",
      });
      await newStatus.save();
    }
    return res.status(200).json({ msg: "Banned successfully" });
  } catch (error) {
    return res.status(500).json({ msg: "Error banning", error: error.message });
  }
};
export const Show_BanShow_Room = async (req, res) => {
  try {
    const Ban_Data = await Status_Model.find().populate("showroomId");
    if (!Ban_Data || Ban_Data.length === 0) {
      return res.status(404).json({ message: "No Ban Showroom" });
    }
    return res.status(201).json({ BanUser: Ban_Data });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const Active_Show_Room = async (req, res) => {
  const { BanId } = req.body;
  const Update_Data = await Status_Model.findByIdAndDelete(BanId);
  if (Update_Data) {
    console.log(Update_Data);
    res.json("update data");
  }
};

// Fetch all pending showrooms
export const getPendingShowrooms = async (req, res) => {
  try {
    const pendingShowrooms = await Status_Model.find({ approved: 0 }).populate(
      "showroomId"
    );
    res.json(pendingShowrooms);
  } catch (error) {
    res.status(500).json({ error: "Error fetching pending showrooms" });
  }
};

// Approve showroom
export const approveShowroom = async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  try {
    const status = await Status_Model.findOne({
      showroomId: id,
    }).populate("showroomId");
    if (!status || status.approved === 1) {
      return res
        .status(404)
        .json({ error: "Showroom not found or already approved" });
    }

    // Approve showroom
    if (isApproved) {
      status.approved = 1;
      await status.save();
      return res.json({ message: "Showroom approved!" });
    } else {
      await signup.deleteOne({ _id: status.showroomId._id });
      await Status_Model.deleteOne({ showroomId: id });
      return res.json({ message: "Showroom approval rejected!" });
    }
  } catch (error) {
    console.error("Error approving showroom:", error);
    res.status(500).json({ error: "Error approving showroom" });
  }
};
