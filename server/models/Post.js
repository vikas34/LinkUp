import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
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

    image_urls: {
      type: [String],
      default: [],
    },

    post_type: {
      type: String,
      enum: ["text", "image", "text_with_image"],
      required: true,
    },

    likes: {
      type: [String], // userIds who liked
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
