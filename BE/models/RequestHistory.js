import mongoose from "mongoose";
import RequestDetail from "./RequestDetail.js";
import User from "./User.js";

const RequestHistorySchema = new mongoose.Schema(
  {
    request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "request_detail",
    },
    action: {
      type: String,
      require: true,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

RequestHistorySchema.pre(/^find/, function (next) {
  this.populate({ path: "request_id", model: RequestDetail });
  this.populate({ path: "author_id", model: User });
  next();
});

export default mongoose.model("request_history", RequestHistorySchema);
