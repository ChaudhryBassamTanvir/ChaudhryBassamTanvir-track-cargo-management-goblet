import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

const sign = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

router.post('/register', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const token = sign(user._id.toString());
    res.status(201).json({
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await User.findOne({ email });

    if (!user || !user.matchPassword(password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = sign(user._id.toString());
    res.json({
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;