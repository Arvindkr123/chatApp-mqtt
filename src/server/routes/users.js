import express from 'express';
import { auth } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password');
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;