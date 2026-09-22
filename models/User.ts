import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  phone?: string
  passwordHash: string
  role: "USER" | "STATION_OWNER" | "ADMIN"
  avatar?: string
  vehicles: mongoose.Types.ObjectId[]
  savedStations: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "STATION_OWNER", "ADMIN"],
      default: "USER",
      index: true,
    },
    avatar: { type: String },
    vehicles: [{ type: Schema.Types.ObjectId, ref: "Vehicle" }],
    savedStations: [{ type: Schema.Types.ObjectId, ref: "Station" }],
  },
  {
    timestamps: true,
  }
)

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
