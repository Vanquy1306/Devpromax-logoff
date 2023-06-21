import Request_detail from "../models/RequestDetail.js";
import RequestHistory from "../models//RequestHistory.js";
import User from "../models/User.js";
import Group from "../models/Group.js";

import jwt from "jsonwebtoken";
import moment from "moment";

export const Get_Request_Detail = async (req, res) => {
  try {
    const request = await Request_detail.findById({
      _id: req.params.id,
    });
    if (!request) {
      res
        .status(404)
        .json({ success: false, message: "Request does not exist" });
    }
    if (request) res.json({ success: true, request });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Get_All_Request = async (req, res) => {
  try {
    const requests = await Request_detail.find({ status: "pending" }).sort([
      ["updatedAt", -1],
    ]);
    res.json({ success: true, requests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllRequestInBelongedGroups = async (req, res) => {
  try {
    //Get current user id
    const authHeader = req.header("Authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user_id = decoded.userId;

    //Get all user's groups
    const groups = await Group.find();
    if (groups.length > 0) {
      const belonged_groups = groups.filter((group) => {
        return (
          group.staffs_id
            .map((staff_id) => staff_id?._id.toString())
            .includes(user_id) ||
          group.masters_id
            .map((master_id) => master_id?._id.toString())
            .includes(user_id)
        );
      });

    //Get all staffs in those groups
    const all_groups_staff_ids = belonged_groups.reduce((acc, group) => {
      // Add all staff and master IDs to the accumulator array
      acc.push(
        ...group.staffs_id.map((staff_id) => staff_id?._id.toString()),
        ...group.masters_id.map((master_id) => master_id?._id.toString())
      );
      return acc;
    }, []);

    //Remove duplicate ids
    const groups_staff_ids = Array.from(new Set(all_groups_staff_ids));

    const requests = await Request_detail.find();

    const groups_requests = requests.filter((request) =>
      groups_staff_ids.includes(request?.user_id?._id.toString())
    );
    res.json({ success: true, requests: groups_requests });

    }



  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Create_Request = async (req, res) => {
  try {
    const {
      reason,
      quantity,
      start_date,
      end_date,
      day_off_type,
      day_off_time,
    } = req.body;
    if (
      !reason ||
      !quantity ||
      !start_date ||
      !end_date ||
      !day_off_type ||
      !day_off_time
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing information" });
    }

    let send_to_slack = false;

    const authHeader = req.header("Authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user_id = decoded.userId;

    const groups_masters = await getUserGroupsMasters(user_id);

    const newRequest = new Request_detail({
      reason,
      quantity,
      start_date,
      end_date,
      user_id,
      day_off_type,
      day_off_time,
      status: "pending",
      approvers_number: groups_masters && groups_masters.length > 0 ? groups_masters.length : 0,
    });
    await newRequest.save();

    const user = await User.findById({ _id: user_id });
    if (user) {
      const username = user.username;
      const day_off_session_desc = day_off_time
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    const day_off_type_desc = day_off_type === "wfh" ? "Work from home" : "Off";

    const description = `
    <p>${username} created a new request<p>
    <br/>
    <p>From: ${start_date}</p>
    <p>To: ${end_date}</p>
    <p>Type: ${day_off_type_desc}</p>
    <p>Session: ${day_off_session_desc} </p>
    <p>Quantity: ${quantity}</p>
    <p>Reason: ${reason}</p>
    `;
    //Add to history
    const newRequestHistory = new RequestHistory({
      request_id: newRequest._id,
      action: "create",
      author_id: user_id,
      description,
    });
    await newRequestHistory.save();
    }

    send_to_slack = true;

    res.json({
      success: true,
      message: "Create day off request successfully!",
      request: newRequest,
      send_to_slack,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Update_Request = async (req, res) => {
  const { reason, quantity, start_date, end_date, day_off_time, day_off_type } =
    req.body;
  try {
    const authHeader = req.header("Authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user_id = decoded.userId;

    let updateRequest = {
      reason,
      quantity,
      start_date,
      end_date,
      user_id,
      day_off_type,
      day_off_type,
    };

    const updateRequestCondition = { _id: req.params.id };
    updateRequest = await Request_detail.findByIdAndUpdate(
      updateRequestCondition,
      updateRequest,
      { new: true }
    );
    if (!updateRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const user = await User.findById({ _id: user_id });
    const username = user.username;

    const day_off_session_desc = day_off_time
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    const day_off_type_desc = day_off_type === "wfh" ? "Work from home" : "Off";

    const description = `
    <p>${username} updated request<p>
    <p>From: ${start_date}</p>
    <p>To: ${end_date}</p>
    <p>Type: ${day_off_type_desc}</p>
    <p>Session: ${day_off_session_desc} </p>
    <p>Quantity: ${quantity}</p>
    <p>Reason: ${reason}</p>
    `;

    const newRequestHistory = new RequestHistory({
      request_id: updateRequest._id,
      action: "update",
      author_id: user_id,
      description,
    });
    await newRequestHistory.save();

    res.json({
      success: true,
      message: "Excellent progress!",
      req: updateRequest,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const Delete_Request = async (req, res) => {
  try {
    const requestDeleteCondition = { _id: req.params.id };
    const deleteRequest = await Request_detail.findOneAndDelete(
      requestDeleteCondition
    );

    if (!deleteRequest)
      return res.status(401).json({
        success: false,
        message: "Request not found",
      });
    res.json({ success: true, req: deleteRequest });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const approveRequest = async (req, res) => {
  try {
    let send_to_slack = false;

    const { request_id } = req.body;
    const request = await Request_detail.findById({
      _id: request_id,
    });

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request does not exist" });
    }

    const authHeader = req.header("Authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user_id = decoded.userId;

    // CHECK IS MASTER
    const master_ids = await getUserGroupsMasters(request?.user_id?._id.toString());

    if (!master_ids.includes(user_id)) {
      return res.json({
        success: false,
        message: "You must be master of staff's group!",
      });
    }

    // CHECK IF USER HAS APPROVED
    const request_history = await RequestHistory.find({
      author_id: user_id,
      request_id,
      action: "approve",
    });

    if (request_history.length > 0) {
      return res.json({
        success: false,
        message: "You has approved this request!",
      });
    }

    // UPDATE APPROVER_NUMBER AND STATUS
    let updateRequest = await Request_detail.findByIdAndUpdate(
      { _id: request_id },
      { approvers_number: request.approvers_number - 1 },
      { new: true }
    );

    if (updateRequest.approvers_number <= 0) {
      updateRequest = await Request_detail.findByIdAndUpdate(
        { _id: request_id },
        { status: "approved" },
        { new: true }
      );

      send_to_slack = true;
    }

    // ADD NEW HISTORY
    const user = await User.findById({ _id: user_id });
    const username = user.username;

    const description = `<p>${username} accepted request</p>`;

    const newRequestHistory = new RequestHistory({
      request_id: request_id,
      action: "approve",
      author_id: user_id,
      description,
    });
    await newRequestHistory.save();

    res.json({
      success: true,
      message: "This request is approved successfully!",
      request: updateRequest,
      history: newRequestHistory,
      send_to_slack,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { request_id } = req.body;
    const request = await Request_detail.findById({
      _id: request_id,
    });
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request does not exist" });
    }

    const authHeader = req.header("Authorization");
    const accessToken = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user_id = decoded.userId;

    //CHECK IS MASTER
    const master_ids = await getUserGroupsMasters(request?.user_id?._id.toString());
    if (!master_ids.includes(user_id)) {
      return res.json({
        success: false,
        message: "You must be master of staff's group!",
      });
    }

    //CHECK IF USER HAS REJECTED
    const request_history = await RequestHistory.find({
      author_id: user_id,
      request_id,
      action: "reject",
    });
    if (request_history.length > 0) {
      return res.json({
        success: false,
        message: "You has rejected this request!",
      });
    }

    const updateRequest = await Request_detail.findByIdAndUpdate(
      { _id: request_id },
      { status: "rejected" },
      { new: true }
    );

    //ADD NEW HISTORY
    const user = await User.findById({ _id: user_id });
    const username = user.username;

    const description = `<p>${username} rejected request</p>`;

    const newRequestHistory = new RequestHistory({
      request_id: request_id,
      action: "reject", //create, update, approve, reject
      author_id: user_id,
      description,
    });
    await newRequestHistory.save();

    res.json({
      success: true,
      message: "This request is rejected successfully!",
      updateRequest,
      newRequestHistory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const countRequestsByStatus = async (req, res) => {
  try {
    const requests = await Request_detail.find();
    const requests_count = requests.reduce((acc, request) => {
      if (acc[request.status]) acc[request.status]++;
      else acc[request.status] = 1;
      return acc;
    }, {});
    const result = Object.keys(requests_count).map((status) => ({
      status,
      count: requests_count[status],
    }));
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const countRequestsByMonth = async (req, res) => {
  try {
    const requests = await Request_detail.find();
    const requests_count = requests.reduce((acc, request) => {
      let month = request.start_date.substring(0, 2);
      if (acc[month]) acc[month]++;
      else acc[month] = 1;
      return acc;
    }, {});

    const arrRequestsWithSpecifiedMonth = Object.keys(requests_count).map(
      (month) => ({
        month: +month,
        count: requests_count[month],
      })
    );

    const minKey = Math.min(
      1,
      ...arrRequestsWithSpecifiedMonth.map((obj) => obj.month)
    );
    const maxKey = Math.max(
      12,
      ...arrRequestsWithSpecifiedMonth.map((obj) => obj.month)
    );

    const arrRequestsWithSequentialMonths = Array.from(
      { length: maxKey - minKey + 1 },
      (_, i) => ({ month: i + minKey, count: 0 })
    ).reduce((acc, obj) => {
      const index = obj.month - minKey;
      const match = arrRequestsWithSpecifiedMonth.find(
        (item) => item.month === obj.month
      );
      if (match) {
        acc[index] = match;
      } else {
        acc[index] = obj;
      }
      return acc;
    }, []);

    const result = arrRequestsWithSequentialMonths.map((request) => {
      return {
        month: moment.monthsShort(request.month - 1),
        count: request.count,
      };
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const countRequestsByDayOffSession = async (req, res) => {
  try {
    const requests = await Request_detail.find();

    let request_day_off_time_count = {};

    requests.forEach((request) => {
      if (!request_day_off_time_count[request.day_off_time]) {
        request_day_off_time_count[request.day_off_time] = 1;
      } else {
        request_day_off_time_count[request.day_off_time]++;
      }
    });

    const result = Object.entries(request_day_off_time_count).map((pair) => {
      return {
        session: pair[0].charAt(0).toUpperCase() + pair[0].slice(1),
        amount: pair[1],
      };
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserGroupsMasters = async (user_id) => {

  const groups = await Group.find();

  const belonged_groups = groups.filter((group) => {
    return group.staffs_id
      .map((staff_id) => staff_id?._id.toString())
      .includes(user_id);
  });

  const all_master_ids = belonged_groups?.map((group) => group.masters_id).flat();

  const master_ids_array = all_master_ids?.map((master) => master?._id.toString());

  const master_ids = Array.from(new Set(master_ids_array));

  return master_ids;
};