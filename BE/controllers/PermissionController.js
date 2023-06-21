import Permission from "../models/Permission.js";

export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort([["createdAt", -1]]);
    res.json({ success: true, permissions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const createPermission = async (req, res) => {
  try {
    const { permission_detail } = req.body;
    const newPermission = new Permission({
      permission_detail,
    });
    await newPermission.save();
    res.json({
      success: true,
      message: "Create complete !",
      permission: newPermission,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
