import mongoose from "mongoose";
const PermissionSchema = new mongoose.Schema(
  {
    permission_detail: {
      type: String,
      require: false,
      unique: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("permission", PermissionSchema);
