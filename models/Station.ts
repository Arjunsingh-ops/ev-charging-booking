import mongoose, { Schema, Document, Model } from "mongoose"

export interface IStation extends Document {
  _id: mongoose.Types.ObjectId
  ownerId: mongoose.Types.ObjectId
  name: string
  description?: string
  address: string
  city: string
  state: string
  pincode: string
  location: {
    type: "Point"
    coordinates: [number, number] // [longitude, latitude]
  }
  photos: string[]
  amenities: string[]
  openingHours: string
  status: "active" | "maintenance" | "inactive"
  rating: number
  totalRatings: number
  createdAt: Date
  updatedAt: Date
}

const StationSchema = new Schema<IStation>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    photos: [{ type: String }],
    amenities: [{ type: String }],
    openingHours: { type: String, default: "24/7 Available" },
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
      index: true,
    },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
)

// 2dsphere index for geospatial queries (distance, radius, nearest)
StationSchema.index({ location: "2dsphere" })
StationSchema.index({ city: 1, status: 1 })

export const Station: Model<IStation> =
  mongoose.models.Station || mongoose.model<IStation>("Station", StationSchema)

export default Station
