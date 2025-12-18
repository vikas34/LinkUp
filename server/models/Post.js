import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: String, // Clerk userId
      required: true,
      ref:'User'
    },

    content: {
      type: String,
      default: "",
    },

    image_urls: {
      type: [String], // array of image URLs
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

    likes_count: {
      type: Number,
      default: 0,
       ref:'User'
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
