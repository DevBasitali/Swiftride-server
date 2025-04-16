import Admin_Model from "../Model/Admin.js";
const loginAdmin = async (req, res) => {
  try {
    if (req.body.name == null && req.body.password == null) {
      return res.send("please enter email or password");
    }
    const Admin_Exist = await Admin_Model.findOne({ role: "admin" });
    if (Admin_Exist) {
      return res.status(400).json("Admin already exist");
    }
    await Admin_Model.create({
      name: req.body.name,
      password: req.body.password,
    });
    console.log(req.body.name);
    console.log(req.body.password);
    return res.send("login");
  } catch (error) {
    return res.status(500).json("Interval server error");
  }
};
export default loginAdmin;
