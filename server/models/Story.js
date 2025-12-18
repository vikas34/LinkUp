import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: String, // Clerk userId
      required: true,
      ref: "User",
    },

    content: {
      type: String,
      default: "",
    },

    media_url: {
      type: [String], // array of image URLs
      default: [],
    },

    media_type: {
      type: String,
      enum: ["text", "image", "video"],
    },

    view_count: [
      {
        type: String,
        default: 0,
        ref: "User",
      },
    ],

    background_color: { type: String },
  },
  { timestamps: true, minimize: false }
);

const Story = mongoose.model("Story", storySchema);
export default Story;
