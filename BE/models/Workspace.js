import mongoose from "mongoose";
import User from "./User.js";
const WorkspaceSchema = new mongoose.Schema(
  {
    workspace_name: {
      type: String,
      require: false,
      unique: true,
    },
    description: {
      type: String,
      require: false,
    },
    status: {
      type: String,
      require: false,
    },
    manager_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);
WorkspaceSchema.pre(/^find/, function (next) {
  this.populate([{ path: "manager_id", model: User }]);
  next();
});
export default mongoose.model("workspace", WorkspaceSchema);
