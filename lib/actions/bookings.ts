"use server"

import connectToDatabase from "@/lib/mongodb"
import Booking from "@/models/Booking"
import Station from "@/models/Station"
import Charger from "@/models/Charger"
import Payment from "@/models/Payment"
import User from "@/models/User"
import { getCurrentSession } from "@/lib/auth"
import mongoose from "mongoose"

export interface CreateBookingInput {
  stationId: string
  chargerId: string
  startTime: string // ISO string or Date parseable
  endTime: string
  estimatedCost: number
  notes?: string
}

export async function createBooking(input: CreateBookingInput) {
  const session = await getCurrentSession()
  if (!session) {
    return { success: false, error: "You must be signed in to book a charging slot." }
  }

  await connectToDatabase()

  const start = new Date(input.startTime)
  const end = new Date(input.endTime)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, error: "Invalid start or end time specified." }
  }

  if (end <= start) {
    return { success: false, error: "End time must be after start time." }
  }

  const chargerObjectId = new mongoose.Types.ObjectId(input.chargerId)
  const stationObjectId = new mongoose.Types.ObjectId(input.stationId)
  const userObjectId = new mongoose.Types.ObjectId(session.userId)

  // Verify charger exists
  const charger = await Charger.findById(chargerObjectId)
  if (!charger) {
    return { success: false, error: "Charger bay not found." }
  }

  // Check for overlapping bookings (Conflict detection)
  const conflictingBooking = await Booking.findOne({
    chargerId: chargerObjectId,
    status: { $in: ["PENDING", "CONFIRMED", "ACTIVE"] },
    $or: [
      { startTime: { $lt: end, $gte: start } },
      { endTime: { $gt: start, $lte: end } },
      { startTime: { $lte: start }, endTime: { $gte: end } },
    ],
  })

  if (conflictingBooking) {
    return {
      success: false,
      error: "This charger is already reserved for the selected time window. Please select another bay or different time slot.",
    }
  }

  // Create booking
  const booking = await Booking.create({
    userId: userObjectId,
    stationId: stationObjectId,
    chargerId: chargerObjectId,
    startTime: start,
    endTime: end,
    status: "CONFIRMED",
    estimatedCost: input.estimatedCost,
    finalCost: input.estimatedCost,
    paymentStatus: "completed",
    notes: input.notes,
  })

  // Create payment record
  await Payment.create({
    bookingId: booking._id,
    userId: userObjectId,
    amount: input.estimatedCost,
    currency: "INR",
    method: "UPI",
    transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    status: "success",
  })

  return {
    success: true,
    bookingId: booking._id.toString(),
  }
}

export async function getUserBookings() {
  const session = await getCurrentSession()
  if (!session) return []

  await connectToDatabase()

  const bookings = await Booking.find({
    userId: new mongoose.Types.ObjectId(session.userId),
  })
    .populate("stationId")
    .populate("chargerId")
    .sort({ startTime: -1 })
    .lean()

  return bookings.map((b) => {
    const station = b.stationId as unknown as { _id: mongoose.Types.ObjectId; name: string; address: string; city: string } | null
    const charger = b.chargerId as unknown as { _id: mongoose.Types.ObjectId; identifier: string; connectorType: string; powerOutput: number } | null

    return {
      id: b._id.toString(),
      stationId: station?._id.toString() || "",
      stationName: station?.name || "Charging Station",
      stationAddress: station ? `${station.address}, ${station.city}` : "Address unavailable",
      chargerBay: charger?.identifier || "Bay 1",
      connectorType: charger?.connectorType || "CCS2",
      powerOutput: charger?.powerOutput || 60,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      status: b.status,
      estimatedCost: b.estimatedCost,
      finalCost: b.finalCost || b.estimatedCost,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt.toISOString(),
    }
  })
}

export async function getBookingById(id: string) {
  await connectToDatabase()

  if (!mongoose.Types.ObjectId.isValid(id)) return null

  const booking = await Booking.findById(id)
    .populate("stationId")
    .populate("chargerId")
    .populate("userId", "name email phone")
    .lean()

  if (!booking) return null

  const station = booking.stationId as unknown as {
    _id: mongoose.Types.ObjectId
    name: string
    address: string
    city: string
    state: string
    openingHours?: string
  } | null

  const charger = booking.chargerId as unknown as {
    _id: mongoose.Types.ObjectId
    identifier: string
    connectorType: string
    powerOutput: number
    pricePerKWh: number
  } | null

  const user = booking.userId as unknown as {
    name: string
    email: string
    phone?: string
  } | null

  return {
    id: booking._id.toString(),
    stationId: station?._id.toString() || "",
    stationName: station?.name || "Charging Station",
    stationAddress: station ? `${station.address}, ${station.city}, ${station.state}` : "",
    openingHours: station?.openingHours || "24/7",
    chargerId: charger?._id.toString() || "",
    chargerBay: charger?.identifier || "Bay 1",
    connectorType: charger?.connectorType || "CCS2",
    powerOutput: charger?.powerOutput || 60,
    pricePerKWh: charger?.pricePerKWh || 18,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    status: booking.status,
    totalPrice: booking.finalCost || booking.estimatedCost,
    paymentStatus: booking.paymentStatus,
    userName: user?.name || "EV Driver",
    userEmail: user?.email || "",
    createdAt: booking.createdAt.toISOString(),
  }
}

export async function cancelBooking(bookingId: string) {
  const session = await getCurrentSession()
  if (!session) return { success: false, error: "Not authenticated" }

  await connectToDatabase()

  const booking = await Booking.findOne({
    _id: new mongoose.Types.ObjectId(bookingId),
    userId: new mongoose.Types.ObjectId(session.userId),
  })

  if (!booking) {
    return { success: false, error: "Booking not found or access denied." }
  }

  booking.status = "CANCELLED"
  await booking.save()

  return { success: true }
}

export async function getListerDashboardData() {
  const session = await getCurrentSession()
  if (!session) return null

  await connectToDatabase()

  const ownerObjectId = new mongoose.Types.ObjectId(session.userId)
  const stations = await Station.find({ ownerId: ownerObjectId }).lean()
  const stationIds = stations.map((s) => s._id)

  const bookings = await Booking.find({ stationId: { $in: stationIds } })
    .populate("stationId", "name")
    .populate("userId", "name email")
    .populate("chargerId", "identifier connectorType")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  const totalStations = stations.length
  const activeStations = stations.filter((s) => s.status === "active").length
  const totalBookings = bookings.length
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "completed")
    .reduce((sum, b) => sum + (b.finalCost || b.estimatedCost || 0), 0)

  return {
    ownerName: session.name,
    totalStations,
    activeStations,
    totalBookings,
    completedBookings,
    totalRevenue,
    stations: stations.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      address: `${s.address}, ${s.city}`,
      status: s.status,
      rating: s.rating,
    })),
    recentBookings: bookings.map((b) => {
      const station = b.stationId as unknown as { name?: string } | null
      const user = b.userId as unknown as { name?: string; email?: string } | null
      const charger = b.chargerId as unknown as { identifier?: string; connectorType?: string } | null

      return {
        id: b._id.toString(),
        stationName: station?.name || "Station",
        userName: user?.name || user?.email || "Driver",
        chargerBay: charger?.identifier || "Bay",
        connectorType: charger?.connectorType || "CCS2",
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        status: b.status,
        totalPrice: b.finalCost || b.estimatedCost,
      }
    }),
  }
}
