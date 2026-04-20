import mongoose, { Schema, models, model } from 'mongoose';

const TicketSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

const Ticket = models.Ticket || model('Ticket', TicketSchema);
export default Ticket;
