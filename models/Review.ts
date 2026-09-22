import mongoose, { Schema, Document, Model } from "mongoose"

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  stationId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  rating: number
  comment?: string
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    stationId: { type: Schema.Types.ObjectId, ref: "Station", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
)

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)

export default Review
