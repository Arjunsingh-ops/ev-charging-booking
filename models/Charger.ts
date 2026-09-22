import mongoose, { Schema, Document, Model } from "mongoose"

export type ConnectorType =
  | "CCS2"
  | "Type 2"
  | "Bharat AC-001"
  | "Bharat DC-001"
  | "CHAdeMO"
  | "GB/T"

export type ChargingSpeed = "Standard" | "Fast" | "Rapid" | "Ultra-Fast"

export interface ICharger extends Document {
  _id: mongoose.Types.ObjectId
  stationId: mongoose.Types.ObjectId
  identifier: string // e.g. "Bay 01 - Gun A"
  connectorType: ConnectorType
  chargingSpeed: ChargingSpeed
  powerOutput: number // in kW
  pricePerKWh: number // in INR
  status: "available" | "in-use" | "offline" | "maintenance"
  availability: boolean
  createdAt: Date
  updatedAt: Date
}

const ChargerSchema = new Schema<ICharger>(
  {
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    identifier: { type: String, required: true, trim: true, default: "Bay 1" },
    connectorType: {
      type: String,
      enum: ["CCS2", "Type 2", "Bharat AC-001", "Bharat DC-001", "CHAdeMO", "GB/T"],
      required: true,
      default: "CCS2",
    },
    chargingSpeed: {
      type: String,
      enum: ["Standard", "Fast", "Rapid", "Ultra-Fast"],
      default: "Fast",
    },
    powerOutput: { type: Number, required: true, min: 1 },
    pricePerKWh: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["available", "in-use", "offline", "maintenance"],
      default: "available",
      index: true,
    },
    availability: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

ChargerSchema.index({ stationId: 1, status: 1 })

export const Charger: Model<ICharger> =
  mongoose.models.Charger || mongoose.model<ICharger>("Charger", ChargerSchema)

export default Charger
