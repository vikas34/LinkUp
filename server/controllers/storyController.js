import imagekit from "../configs/imagekit.js";
import fs from "fs";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";

export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;

    let media_url = "";

    // ---------- Upload media ----------
    if (media_type === "image" || media_type === "video") {
      if (!media) {
        return res.status(400).json({
          success: false,
          message: "Media file is required",
        });
      }

      // ✅ MUST be ReadStream
      const response = await imagekit.files.upload({
        file: fs.createReadStream(media.path),
        fileName: media.originalname,
      });

      media_url = response.url;

      // optional: delete local file after upload
      fs.unlinkSync(media.path);
    }

    // ---------- Create story ----------
    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
    });

    res.json({ success: true, story });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//------------- Get User Stories -------------
export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    const userIds = [userId, ...user.connections, ...user.following];

    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
