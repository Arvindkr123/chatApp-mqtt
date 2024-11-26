import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = 'sdfsdfgjknsdfkgsdkfglbsdkfgjbsdfglbsdfgkjlsdbfgskdjfbgsdfg'; // In production, use environment variable

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export { JWT_SECRET };