import express from "express";
import { auth } from "../middleware/auth.js";
import { Message } from "../models/Message.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  //console.log("reciver user id ", req.params.userId);
  try {
    //console.log(req.body);

    const message = new Message({
      sender: req.body.sender,
      receiver: req.body.receiver,
      content: req.body.content,
    })

    const savedMessage = await message.save();
    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: savedMessage // Include the saved message
    });
    // content
    // receiver
    // sender 
    // timestamp

  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/:userId", auth, async (req, res) => {
  //console.log("reciver user id ", req.params.userId);
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    }).sort({ timestamp: 1 });

    console.log(messages);
    
    res.send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
