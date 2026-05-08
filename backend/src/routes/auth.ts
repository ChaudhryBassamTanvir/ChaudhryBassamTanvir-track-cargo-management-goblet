import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();
const sign = (id: string) => jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

router.post('/register', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ token: sign(user._id.toString()), user: { ...user.toObject(), password: undefined } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.matchPassword(password)) {
      res.status(401).json({ error: 'Invalid credentials' }); return;
    }
    res.json({ token: sign(user._id.toString()), user: { ...user.toObject(), password: undefined } });
  } catch (err) { next(err); }
});

export default router;