import mongoose, { Schema, Document, Model } from "mongoose"

export type BookingStatus = "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED"
export type PaymentStatus = "pending" | "completed" | "refunded"

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  stationId: mongoose.Types.ObjectId
  chargerId: mongoose.Types.ObjectId
  vehicleId?: mongoose.Types.ObjectId
  startTime: Date
  endTime: Date
  status: BookingStatus
  estimatedCost: number
  finalCost?: number
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    chargerId: { type: Schema.Types.ObjectId, ref: "Charger", required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "CONFIRMED",
      index: true,
    },
    estimatedCost: { type: Number, required: true, min: 0 },
    finalCost: { type: Number, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "refunded"],
      default: "completed",
      index: true,
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for booking queries and conflict detection
BookingSchema.index({ chargerId: 1, startTime: 1, endTime: 1, status: 1 })
BookingSchema.index({ userId: 1, createdAt: -1 })
BookingSchema.index({ stationId: 1, createdAt: -1 })

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema)

export default Booking
