import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastSeen: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);