import Status_Model from "../Model/showroomStatus.js";

export const isShowroomApproved = async (req, res, next) => {
  try {
    console.log(req.user);
    const showroomStatus = await Status_Model.findOne({
      showroomId: req.user,
    }); // Assuming req.user is populated with logged-in user's ID
    if (!showroomStatus || showroomStatus.approved !== 1) {
      return res
        .status(403)
        .json({ error: "Access denied. Showroom not approved." });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Error verifying showroom approval" });
  }
};
