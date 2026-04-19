import mongoose, { Schema, models, model } from 'mongoose';

const AddressSchema = new Schema({
  fullName: String,
  line1: String,
  city: String,
  state: String,
  pincode: String,
}, { _id: false });

const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },       // PAN
  userName: String,
  userEmail: String,
  userPhone: String,
  productId: String,
  productName: String,
  productPrice: Number,
  address: AddressSchema,
  deliveryDays: Number,
  deliveryDate: String,
  paymentPlan: Number,
  monthsRemaining: Number,
  nextPaymentDate: String,
  downPayment: Number,
  loanAmount: Number,
  emiAmount: Number,
  coinsUsed: Number,
  invoiceDate: String,
  status: { type: String, enum: ['processing', 'shipped', 'delivered'], default: 'processing' },
}, { timestamps: true });

const Order = models.Order || model('Order', OrderSchema);
export default Order;
