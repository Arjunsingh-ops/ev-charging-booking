import mongoose, { Schema, Document, Model } from "mongoose"

export interface IChargingSession extends Document {
  _id: mongoose.Types.ObjectId
  bookingId?: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  chargerId: mongoose.Types.ObjectId
  stationId: mongoose.Types.ObjectId
  startTime: Date
  endTime?: Date
  energyDelivered: number // kWh
  currentPower: number // kW
  cost: number
  status: "starting" | "charging" | "completed" | "stopped" | "fault"
  createdAt: Date
  updatedAt: Date
}

const ChargingSessionSchema = new Schema<IChargingSession>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    chargerId: { type: Schema.Types.ObjectId, ref: "Charger", required: true, index: true },
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    energyDelivered: { type: Number, default: 0 },
    currentPower: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["starting", "charging", "completed", "stopped", "fault"],
      default: "charging",
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

export const ChargingSession: Model<IChargingSession> =
  mongoose.models.ChargingSession ||
  mongoose.model<IChargingSession>("ChargingSession", ChargingSessionSchema)

export default ChargingSession
