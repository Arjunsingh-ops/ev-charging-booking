import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId
  bookingId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  amount: number
  currency: string
  method: "UPI" | "Card" | "NetBanking" | "Wallet"
  transactionId: string
  status: "success" | "pending" | "failed" | "refunded"
  gatewayResponse?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    method: {
      type: String,
      enum: ["UPI", "Card", "NetBanking", "Wallet"],
      default: "UPI",
    },
    transactionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["success", "pending", "failed", "refunded"],
      default: "success",
      index: true,
    },
    gatewayResponse: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
)

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema)

export default Payment
