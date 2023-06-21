import mongoose from "mongoose";
// const mongoose = require("mongoose");
import Role from "./Role.js";
import Group from "./Group.js";
import Permission from "./Permission.js";
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      require: true,
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
    },
    permission_id: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "permission",
      },
    ],

    slack_id: {
      type: String,
    },

  },
  { timestamps: true }
);
UserSchema.pre(/^find/, function (next) {
  this.populate([
    { path: "role_id", model: Role },
    { path: "group_id", model: Group },
    { path: "permission_id", model: Permission },
  ]);
  next();
});

export default mongoose.model("user", UserSchema);
