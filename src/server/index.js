import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import aedes from 'aedes';
import { createServer } from 'net';
import ws from 'websocket-stream';
import { createServer as createHttpServer } from 'http';
import { User } from './models/User.js';
import { JWT_SECRET } from './middleware/auth.js';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/chatapp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

const broker = aedes();
const mqttServer = createServer(broker.handle);
const httpServer = createHttpServer();
const wsServer = ws.createServer({ server: httpServer }, broker.handle);

const mqttPort = 1883;
const wsPort = 8883;
const apiPort = 3000;

mqttServer.listen(mqttPort, () => {
  console.log('MQTT broker running on port:', mqttPort);
});

httpServer.listen(wsPort, () => {
  console.log('WebSocket MQTT broker running on port:', wsPort);
});

app.listen(apiPort, () => {
  console.log('API Server running on port:', apiPort);
});

broker.authenticate = async (client, username, password, callback) => {
  try {
    const token = password.toString();
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) throw new Error();
    callback(null, true);
  } catch (error) {
    callback(error, false);
  }
};