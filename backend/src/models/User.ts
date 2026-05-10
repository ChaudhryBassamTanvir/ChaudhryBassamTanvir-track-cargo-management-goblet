import mongoose, { Document } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'dispatcher' | 'viewer';
  matchPassword(pass: string): boolean;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'dispatcher', 'viewer'],
      default: 'dispatcher',
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = crypto
    .createHash('sha256')
    .update(this.password)
    .digest('hex');
  next();
});

UserSchema.methods.matchPassword = function (pass: string): boolean {
  return (
    this.password ===
    crypto.createHash('sha256').update(pass).digest('hex')
  );
};

export default mongoose.model<IUser>('User', UserSchema);