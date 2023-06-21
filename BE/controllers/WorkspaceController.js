import Workspace from "../models/Workspace.js";

export const Get_Workspace_Detail = async (req, res) => {
  try {
    const workspace = await Workspace.findById({
      _id: req.params.id,
    });
    if (!workspace) {
      res
        .status(404)
        .json({ success: false, message: "Workspace is not exist" });
    }
    if (workspace) res.json({ success: true, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Get_All_Workspace = async (req, res) => {
  try {
    const workspace = await Workspace.find().sort([["createdAt", -1]]);
    res.json({ success: true, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addRoleWorkspace = async (req, res) => {
  const { Manager_id } = req.body;
  try {
    const addRole = await Workspace.findByIdAndUpdate(req.params.id, {
      Manager_id: Manager_id,
    });
    await addRole.save();
    res.json({
      success: true,
      message: "Done !",
      work_space: addRole,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Create_Workspace = async (req, res) => {
  try {
    const { workspace_name, description, manager_id = [], status } = req.body;
    if (!workspace_name || manager_id.length <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Missing information" });
    const newWorkspace = new Workspace({
      workspace_name,
      description,
      status,
      manager_id,
    });
    await newWorkspace.save();
    res.json({
      success: true,
      message: "Create complete !",
      work_space: newWorkspace,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Update_Workspace = async (req, res) => {
  const { workspace_name, description, manager_id = [], status } = req.body;
  if (manager_id.length <= 0)
    return res
      .status(400)
      .json({
        success: false,
        message: "Need at least one manager in the workspace !!!",
      });
  try {
    let updateWorkspace = {
      workspace_name,
      description,
      status,
      manager_id,
    };
    const updateWorkspaceCondition = { _id: req.params.id };
    updateWorkspace = await Workspace.findByIdAndUpdate(
      updateWorkspaceCondition,
      updateWorkspace,
      { new: true }
    );
    if (!updateWorkspace)
      return res.status(401).json({
        success: false,
        message: "Workspace not found",
      });
    res.json({
      success: true,
      message: "Excellent progress!",
      req: updateWorkspace,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Delete_Workspace = async (req, res) => {
  try {
    const requestWorkspaceCondition = { _id: req.params.id };
    const deleteWorkspace = await Workspace.findOneAndDelete(
      requestWorkspaceCondition
    );
    if (!deleteWorkspace)
      return res.status(401).json({
        success: false,
        message: "Request not found ",
      });
    res.json({ success: true, req: deleteWorkspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
