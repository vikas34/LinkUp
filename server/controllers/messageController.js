import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Message from "../models/Message.js";

const connections = new Map();

export const sseController = (req, res) => {
  const { userId } = req.params;
  console.log("New Client Connected:", userId);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.();

  if (!connections.has(userId)) {
    connections.set(userId, []);
  }

  const userConnections = connections.get(userId);
  userConnections.push(res);
  console.log(`User ${userId} now has ${userConnections.length} connections`);

  res.write(`event: connected\ndata: SSE Connected\n\n`);

  req.on("close", () => {
    const userConnections = connections.get(userId);
    if (userConnections) {
      const index = userConnections.indexOf(res);
      if (index > -1) {
        userConnections.splice(index, 1);
        console.log(
          `Removed connection for ${userId}. Remaining: ${userConnections.length}`
        );
        if (userConnections.length === 0) {
          connections.delete(userId);
          console.log(`Cleaned up all connections for ${userId}`);
        }
      }
    }
  });
};

export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (image) {
      if (!image.path) {
        throw new Error("Upload error: image.path is undefined.");
      }
      const fileStream = fs.createReadStream(image.path);
      const response = await imagekit.files.upload({
        file: fileStream,
        fileName: image.originalname,
      });
      media_url = imagekit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
        transformation: [{ width: 1280, quality: "auto", format: "webp" }],
      });
      fs.unlinkSync(image.path);
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
      seen: false,
    });

    res.json({ success: true, message });

    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id"
    );

    const userConnections = connections.get(to_user_id);
    if (userConnections?.length > 0) {
      console.log(
        `Broadcasting to ${to_user_id}: ${userConnections.length} connections`
      );
      const connectionsCopy = [...userConnections];

      connectionsCopy.forEach((connectionRes, index) => {
        if (!connectionRes.writableEnded) {
          const success = connectionRes.write(
            `data: ${JSON.stringify(messageWithUserData)}\n\n`
          );
          console.log(
            `✅ Sent to ${to_user_id} connection ${index + 1}/${
              connectionsCopy.length
            }:`,
            success ? "OK" : "FAILED"
          );
        }
      });
    }
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    })
      .populate("from_user_id")
      .sort({ created_at: -1 });

    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("getChatMessages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();

    const recentMessages = await Message.aggregate([
      {
        $match: {
          to_user_id: userId,
        },
      },
      { $sort: { created_at: -1 } },

      {
        $group: {
          _id: "$from_user_id",
          latestMessage: { $first: "$$ROOT" },
          unseenCount: {
            $sum: { $cond: [{ $eq: ["$seen", false] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "from_user_id",
        },
      },
      { $unwind: "$from_user_id" },
      {
        $project: {
          from_user_id: 1,
          text: "$latestMessage.text",
          message_type: "$latestMessage.message_type",
          media_url: "$latestMessage.media_url",

          created_at: "$latestMessage.created_at",

          created_at_ist: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M",
              date: "$latestMessage.created_at",
              timezone: "+05:30",
            },
          },

          unseenCount: 1,
        },
      },
      { $sort: { created_at: -1 } },
    ]);

    res.json({ success: true, messages: recentMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
