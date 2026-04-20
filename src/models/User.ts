import mongoose, { Schema, models, model } from 'mongoose';

const UserSchema = new Schema({
  pan: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  income: { type: Number, required: true },
  creditLimit: { type: Number, required: true },
  flexiCoins: { type: Number, default: 0 },
  employmentStatus: { type: String, enum: ['salaried', 'non-salaried'], default: 'salaried' },
  joinedAt: { type: Date, default: Date.now },
});

// Prevent model re-compilation during Next.js hot-reload
const User = models.User || model('User', UserSchema);
export default User;
