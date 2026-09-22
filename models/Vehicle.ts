import mongoose, { Schema, Document, Model } from "mongoose"

export interface IVehicle {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  make: string
  model: string
  variant?: string
  registrationNumber: string
  batteryCapacity: number // in kWh
  connectorTypes: string[]
  createdAt: Date
  updatedAt: Date
}

const VehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    variant: { type: String, trim: true },
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    batteryCapacity: { type: Number, required: true, min: 1 },
    connectorTypes: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
)

export const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>("Vehicle", VehicleSchema)

export default Vehicle
