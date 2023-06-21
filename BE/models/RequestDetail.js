import mongoose from "mongoose";
mongoose.set("strictQuery", false);
import { Schema } from "mongoose";
import User from "./User.js";
const RequestSchema = Schema(
  {
    reason: {
      type: String,
      sparse: true,
      required: true,
    },
    quantity: {
      type: Number,
      sparse: true,
      required: true,
    },
    start_date: {
      type: String,
      sparse: true,
      required: true,
    },
    end_date: {
      type: String,
      sparse: true,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    day_off_type: {
      type: String,
    },
    day_off_time: {
      type: String,
    },
    status: {
      type: String,
      sparse: true,
      required: true,
    },
    approvers_number: {
      type: Number,
      sparse: true,
      required: true,
    },
  },
  { timestamps: true }
);
RequestSchema.pre(/^find/, function (next) {
  this.populate([{ path: "user_id", model: User }]);
  next();
});
const Request_detail = mongoose.model("request_detail", RequestSchema);
export default Request_detail;
