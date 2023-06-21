import RequestHistory from "../models/RequestHistory.js";

export const getRequestHistory = async (req, res) => {
  try {
    const request_id = req.params.id;
    const request_histories = await RequestHistory.find({ request_id }).sort([
      ["createdAt"],
    ]);
    res.json({ success: true, request_histories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
