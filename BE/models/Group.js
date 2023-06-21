import mongoose from "mongoose";
import Workspace from "./Workspace.js";
import User from "./User.js";
const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    description: {
      type: String,
    },
    workspace_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspace",
    },
    masters_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    staffs_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);
GroupSchema.pre(/^find/, function (next) {
  this.populate([{ path: "workspace_id", model: Workspace }]);
  this.populate([{ path: "masters_id", model: User }]);
  this.populate([{ path: "staffs_id", model: User }]);

  next();
});
export default mongoose.model("group", GroupSchema);
