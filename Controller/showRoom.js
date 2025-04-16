import signup from "../Model/signup.js";

export const showAllShowRooms = async (req, res) => {
  try {
    const showRooms = await signup.find(
      { role: "showroom" },
      "showroomName address",
    );

    res.status(200).json({
      success: true,
      data: showRooms,
    });
  } catch (err) {
    console.error("Error fetching showrooms:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch showrooms. Please try again later.",
    });
  }
};
