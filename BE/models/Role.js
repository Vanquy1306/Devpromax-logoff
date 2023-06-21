import mongoose from "mongoose";
const RoleSchema = new mongoose.Schema(
  {
    role_name: {
      type: String,
      require: false,
      unique: true,
    },
    description: {
      type: String,
      require: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("role", RoleSchema);
