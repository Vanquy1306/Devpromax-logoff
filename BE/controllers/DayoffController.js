import Request_detail from "../models/RequestDetail.js";
import RequestHistory from "../models/RequestHistory.js";
import Group from "../models/Group.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const Get_All_DayOff = async (req, res) => {
  try {
    const request = await Request_detail.find({
      status: "approved" || "rejected",
    }).sort([["createdAt", -1]]);
    res.json({ success: true, request });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const delete_DayOff = async (req, res) => {
  try {
    const DeleteCondition = { _id: req.params.id };
    const delete_DayOff = await Request_detail.findOneAndDelete(
      DeleteCondition
    );
    if (!delete_DayOff)
      return res.status(404).json({
        success: false,
        message: "Day Off not found ",
      });
    res.json({ success: true, dayOff: delete_DayOff });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const Revert_DayOff = async (req, res) => {
  const { reason, quantity, start_date, end_date, day_off_time, day_off_type } =
    req.body;
  const Id = req.params.id;
  try {
    const request = await Request_detail.find({
      _id: Id,
    });
    var data = request[0]?.user_id._id.toString();
    if (request.length <= 0) {
      res.json({
        success: false,
        message: "Day Off does not have enough condition to revert !!!",
      });
    } else if (
      request[0]?.status === "approved" ||
      request[0]?.status === "rejected"
    ) {
      const groups_masters = await getUserGroupsMasters(data);
      let revertRequest = {
        reason,
        quantity,
        start_date,
        end_date,
        user_id: data,
        day_off_time,
        day_off_type,
        status: "pending",
        approvers_number: groups_masters.length,
      };
      const revertRequestCondition = { _id: req.params.id };
      revertRequest = await Request_detail.findByIdAndUpdate(
        revertRequestCondition,
        revertRequest,
        { new: true }
      );

      const user = await User.findById({ _id: data });
      const username = user.username;
      console.log(username);
      const day_off_session_desc = day_off_time
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      const day_off_type_desc =
        day_off_type === "wfh" ? "Work from home" : "Off";

      const description = `
      <p>${username} reverted this request<p>
      <br/>
      <p>From: ${start_date}</p>
      <p>To: ${end_date}</p>
      <p>Type: ${day_off_type_desc}</p>
      <p>Session: ${day_off_session_desc} </p>
      <p>Quantity: ${quantity}</p>
      <p>Reason: ${reason}</p>
      `;

      await RequestHistory.findOneAndDelete({
        action: "approve",
        request_id: Id,
      });

      //Add to history
      const newRequestHistory = new RequestHistory({
        request_id: Id,
        action: "revert",
        author_id: data,
        description,
      });
      console.log(newRequestHistory);
      await newRequestHistory.save();

      res.json({ success: true, revertRequest });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const Get_Information_Request = async (req, res) => {
  try {
    const id = req.params.id;
    const information_request = await RequestHistory.find({ request_id: id });
    res.json({ success: true, information_request });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const informationRequest = async (req, res) => {
  try {
    const { action, author_id } = req.body;
    if (action === "approved") {
      const newRequest = new RequestHistory({
        action,
        request_id: req.params.id,
        author_id,
      });
      await newRequest.save();
      res.json({
        success: true,
        message: "update success",
        request: newRequest,
      });
    } else if (action === "rejected") {
      const newRequest = new RequestHistory({
        action,
        request_id: req.params.id,
        author_id,
      });
      await newRequest.save();
      res.json({
        success: true,
        message: "update success",
        request: newRequest,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Missing information !" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const getUserGroupsMasters = async (user_id) => {
  const groups = await Group.find();
  const belonged_groups = groups.filter((group) => {
    return group.staffs_id
      .map((staff_id) => staff_id._id.toString())
      .includes(user_id);
  });

  const all_master_ids = belonged_groups
    .map((group) => group.masters_id)
    .flat();

  const master_ids_array = all_master_ids.map((master) => master._id);

  const master_ids = Array.from(new Set(master_ids_array));

  return master_ids;
};
