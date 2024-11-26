import express from "express";
import { auth } from "../middleware/auth.js";
import { Message } from "../models/Message.js";

const router = express.Router();

router.get("/:userId", auth, async (req, res) => {
  console.log("reciver user id ", req.params.userId);
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    }).sort({ timestamp: 1 });
    res.send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
