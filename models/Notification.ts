import mongoose, { Schema, Document, Model } from "mongoose"

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  title: string
  message: string
  read: boolean
  type: "booking" | "station" | "system"
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
    type: {
      type: String,
      enum: ["booking", "station", "system"],
      default: "booking",
    },
  },
  {
    timestamps: true,
  }
)

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification
