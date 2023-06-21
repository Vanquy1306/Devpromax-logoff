import Group from "../models/Group.js";

export const get_All_Groups = async (req, res) => {
  try {
    const groups = await Group.find().sort([["createdAt", -1]]);
    const groups_info = groups.map((group) => ({
      id: group.id,
      name: group.name ? group.name : '',
      masters: group.masters_id ? group.masters_id.map(({_id, username}) => ({_id, name: username})) : [],
      staffs: group.staffs_id ? group.staffs_id.map(({_id, username}) => ({_id, name: username})) : [],
    }));
    res.json({ success: true, groups: groups_info });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const get_Group = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    res.status(200).json({
        id: group.id,
        name: group.name ? group.name : '',
        masters: group.masters_id ? group.masters_id.map(({_id, username}) => ({_id, name: username})) : [],
        staffs: group.staffs_id ? group.staffs_id.map(({_id, username}) => ({_id, name: username})) : [],
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
    });
  }
};

export const create_Group = async (req, res) => {
  try {
    const { name, masters_id, staffs_id } = req.body;
    const newGroup = new Group({
      name,
      masters_id,
      staffs_id,
    });
    await newGroup.save();
    res.json({
      success: true,
      message: "Create complete !",
      group: newGroup,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const update_Group = async (req, res) => {
  try {
    const { name, description, staffs_id, masters_id } = req.body;
    // Simple validation
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Missing information !" });
    let updateGroup = {
      name,
      description,
      staffs_id,
      masters_id
    };
    const updateGroupCondition = { _id: req.params.id };
    updateGroup = await Group.findByIdAndUpdate(
      updateGroupCondition,
      updateGroup,
      { new: true }
    );
    if (!updateGroup)
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });

    res.json({
      success: true,
      message: "Excellent progress!",
      Group: updateGroup,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const delete_Group = async (req, res) => {
  try {
    const groupDeleteCondition = { _id: req.params.id };
    const deleteGroup = await Group.findOneAndDelete(groupDeleteCondition);
    if (!deleteGroup)
      return res.status(404).json({
        success: false,
        message: "Group not found ",
      });
    res.json({ success: true, group: deleteGroup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addGroupStaff = async (req, res) => {
  try {
    const { staff_id, group_id } = req.body;

    const group = await Group.findOne({ _id: group_id });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found!",
      });
    }

    const master_ids = group.masters_id.map((master_id) => master_id._id.toString());
    const is_master = master_ids.includes(staff_id.toString());
    if (is_master) {
      return res.status(400).json({
        success: false,
        message: "Staff is already a group master!",
      });
    }

    const staff_ids = group.staffs_id.map((staff_id) => staff_id._id.toString());
    const is_staff = staff_ids.includes(staff_id.toString());
    if (is_staff) {
      return res.status(400).json({
        success: false,
        message: "Staff is already in group!",
      });
    }

    group.staffs_id.push(staff_id);
    await group.save();
    res.json({ 
      success: true, 
      message: "Add new member successfully!",
      staffs: group.staffs_id ? group.staffs_id.map(({_id, username}) => ({_id, name: username})) : [],
     });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
    });
  }
};

export const removeGroupStaff = async (req, res) => {
  try {
    const { staff_id, group_id } = req.body;

    const group = await Group.findOne({ _id: group_id });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found!",
      });
    }

    const staff_ids = group.staffs_id.map((staff_id) => staff_id._id.toString());
    const is_staff = staff_ids.includes(staff_id.toString());
    if (!is_staff) {
      return res.status(400).json({
        success: false,
        message: "Staff does not belong to this group!",
      });
    }

    group.staffs_id.pop(staff_id);
    await group.save();
    res.json({ 
      success: true, 
      message: "Member removed successfully!",
      staffs: group.staffs_id ? group.staffs_id.map(({_id, username}) => ({_id, name: username})) : [],
      
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
