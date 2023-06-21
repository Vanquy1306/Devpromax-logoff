import mongoose from "mongoose";
const SlackSchema = new mongoose.Schema(
  {
    day_off_channel: [
      {
        type: String,
        require: false,
      },
    ],
    hr_channel: [
      {
        type: String,
        require: false,
      },
    ],
    by_email: {
      type: Boolean,
      require: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("slack", SlackSchema);
