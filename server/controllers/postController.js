import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// --------- Add Post ---------

export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;

    let image_urls = [];

    if (images && images.length > 0) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          // Upload using ReadStream (BEST practice)
          const response = await imagekit.files.upload({
            file: fs.createReadStream(image.path),
            fileName: image.originalname,
            folder: "/posts",
          });

          // Build optimized URL
          const url = imagekit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.filePath,
            transformation: [
              {
                width: 1280,
                quality: 80,
                format: "webp",
              },
            ],
          });

          // Remove local file after upload
          fs.unlinkSync(image.path);

          return url;
        })
      );
    }

    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// -------------Get Posts--------------
export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    //User connections followings
    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ------------Like Post----------------
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.json({ success: false, message: "Post not found" });
    }

    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter(
        (id) => id.toString() !== userId
      );
      await post.save();
      res.json({ success: true, message: "Post unliked" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      res.json({ success: true, message: "Post liked" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
