"use server"

import connectToDatabase from "@/lib/mongodb"
import Station, { IStation } from "@/models/Station"
import Charger, { ICharger } from "@/models/Charger"
import Review from "@/models/Review"
import { getCurrentSession } from "@/lib/auth"
import mongoose from "mongoose"

export interface StationFilterParams {
  city?: string
  search?: string
  connectorType?: string
  lat?: number
  lng?: number
  maxDistanceKm?: number
}

export interface FormattedStation {
  id: string
  name: string
  description?: string
  address: string
  city: string
  state: string
  pincode: string
  latitude: number
  longitude: number
  status: string
  rating: number
  totalRatings: number
  photos: string[]
  amenities: string[]
  openingHours: string
  chargers: {
    id: string
    identifier: string
    connectorType: string
    chargingSpeed: string
    powerOutput: number
    pricePerKWh: number
    status: string
  }[]
  minPrice: number
  connectorTypes: string[]
  totalPower: number
  distanceKm?: number
}

export async function getStations(params: StationFilterParams = {}): Promise<FormattedStation[]> {
  await connectToDatabase()

  const query: Record<string, unknown> = {
    status: { $ne: "inactive" },
  }

  if (params.city && params.city !== "all") {
    query.city = { $regex: new RegExp(`^${params.city}$`, "i") }
  }

  if (params.search && params.search.trim() !== "") {
    const searchRegex = { $regex: params.search.trim(), $options: "i" }
    query.$or = [
      { name: searchRegex },
      { address: searchRegex },
      { city: searchRegex },
    ]
  }

  // Geospatial query if lat & lng are provided
  if (typeof params.lat === "number" && typeof params.lng === "number") {
    const maxMeters = (params.maxDistanceKm || 50) * 1000
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [params.lng, params.lat],
        },
        $maxDistance: maxMeters,
      },
    }
  }

  const rawStations = await Station.find(query).lean()
  const stationIds = rawStations.map((s) => s._id)

  const chargerQuery: Record<string, unknown> = {
    stationId: { $in: stationIds },
  }

  if (params.connectorType && params.connectorType !== "all") {
    chargerQuery.connectorType = params.connectorType
  }

  const rawChargers = await Charger.find(chargerQuery).lean()

  // Map chargers to stations
  const chargersByStation = new Map<string, typeof rawChargers>()
  for (const charger of rawChargers) {
    const sId = charger.stationId.toString()
    if (!chargersByStation.has(sId)) {
      chargersByStation.set(sId, [])
    }
    chargersByStation.get(sId)!.push(charger)
  }

  const result: FormattedStation[] = []

  for (const st of rawStations) {
    const stationIdStr = st._id.toString()
    const stChargers = chargersByStation.get(stationIdStr) || []

    // If a connectorType filter was specified and station has no matching chargers, skip
    if (params.connectorType && params.connectorType !== "all" && stChargers.length === 0) {
      continue
    }

    const connectorSet = new Set<string>()
    let minPrice = Infinity
    let totalPower = 0

    const formattedChargers = stChargers.map((c) => {
      connectorSet.add(c.connectorType)
      if (c.pricePerKWh < minPrice) minPrice = c.pricePerKWh
      totalPower += c.powerOutput || 0
      return {
        id: c._id.toString(),
        identifier: c.identifier,
        connectorType: c.connectorType,
        chargingSpeed: c.chargingSpeed,
        powerOutput: c.powerOutput,
        pricePerKWh: c.pricePerKWh,
        status: c.status,
      }
    })

    result.push({
      id: stationIdStr,
      name: st.name,
      description: st.description,
      address: st.address,
      city: st.city,
      state: st.state,
      pincode: st.pincode,
      latitude: st.location.coordinates[1],
      longitude: st.location.coordinates[0],
      status: st.status,
      rating: st.rating || 4.5,
      totalRatings: st.totalRatings || 0,
      photos: st.photos || [],
      amenities: st.amenities || [],
      openingHours: st.openingHours || "24/7 Available",
      chargers: formattedChargers,
      minPrice: minPrice === Infinity ? 18 : minPrice,
      connectorTypes: Array.from(connectorSet),
      totalPower,
    })
  }

  return result
}

export async function getStationById(id: string) {
  await connectToDatabase()

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null
  }

  const station = await Station.findById(id).lean()
  if (!station) return null

  const chargers = await Charger.find({ stationId: station._id }).lean()
  const reviews = await Review.find({ stationId: station._id })
    .populate("userId", "name avatar")
    .sort({ createdAt: -1 })
    .lean()

  return {
    id: station._id.toString(),
    ownerId: station.ownerId.toString(),
    name: station.name,
    description: station.description,
    address: station.address,
    city: station.city,
    state: station.state,
    pincode: station.pincode,
    latitude: station.location.coordinates[1],
    longitude: station.location.coordinates[0],
    status: station.status,
    rating: station.rating,
    totalRatings: station.totalRatings,
    photos: station.photos,
    amenities: station.amenities,
    openingHours: station.openingHours,
    chargers: chargers.map((c) => ({
      id: c._id.toString(),
      identifier: c.identifier,
      connectorType: c.connectorType,
      chargingSpeed: c.chargingSpeed,
      powerOutput: c.powerOutput,
      pricePerKWh: c.pricePerKWh,
      status: c.status,
      availability: c.availability,
    })),
    reviews: reviews.map((r) => ({
      id: r._id.toString(),
      rating: r.rating,
      comment: r.comment,
      userName: (r.userId as unknown as { name?: string })?.name || "EV Driver",
      createdAt: r.createdAt.toISOString(),
    })),
  }
}

export async function createStation(formData: {
  name: string
  description?: string
  address: string
  city: string
  state: string
  pincode: string
  latitude: number
  longitude: number
  amenities?: string[]
  openingHours?: string
  chargers: {
    identifier: string
    connectorType: string
    chargingSpeed: string
    powerOutput: number
    pricePerKWh: number
  }[]
}) {
  const session = await getCurrentSession()
  if (!session || (session.role !== "STATION_OWNER" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized: Only registered station owners can add stations.")
  }

  await connectToDatabase()

  const station = await Station.create({
    ownerId: new mongoose.Types.ObjectId(session.userId),
    name: formData.name,
    description: formData.description,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    pincode: formData.pincode,
    location: {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    },
    amenities: formData.amenities || [],
    openingHours: formData.openingHours || "24/7 Available",
    status: "active",
  })

  if (formData.chargers && formData.chargers.length > 0) {
    const chargerDocs = formData.chargers.map((c) => ({
      stationId: station._id,
      identifier: c.identifier || "Bay 1",
      connectorType: c.connectorType,
      chargingSpeed: c.chargingSpeed,
      powerOutput: c.powerOutput,
      pricePerKWh: c.pricePerKWh,
      status: "available",
      availability: true,
    }))
    await Charger.insertMany(chargerDocs)
  }

  return { success: true, stationId: station._id.toString() }
}

export async function getOwnerStations() {
  const session = await getCurrentSession()
  if (!session) return []

  await connectToDatabase()

  const stations = await Station.find({
    ownerId: new mongoose.Types.ObjectId(session.userId),
  }).sort({ createdAt: -1 }).lean()

  const stationIds = stations.map((s) => s._id)
  const chargers = await Charger.find({ stationId: { $in: stationIds } }).lean()

  return stations.map((s) => {
    const stChargers = chargers.filter((c) => c.stationId.toString() === s._id.toString())
    return {
      id: s._id.toString(),
      name: s.name,
      address: s.address,
      city: s.city,
      state: s.state,
      status: s.status,
      rating: s.rating,
      chargerCount: stChargers.length,
      chargers: stChargers.map((c) => ({
        id: c._id.toString(),
        identifier: c.identifier,
        connectorType: c.connectorType,
        powerOutput: c.powerOutput,
        pricePerKWh: c.pricePerKWh,
        status: c.status,
      })),
    }
  })
}

export async function updateStation(
  stationId: string,
  formData: {
    name: string
    description?: string
    address: string
    city: string
    state: string
    pincode: string
    amenities?: string[]
    openingHours?: string
    status?: "active" | "maintenance" | "inactive"
    powerOutput?: number
    pricePerKWh?: number
    connectorType?: string
  }
) {
  const session = await getCurrentSession()
  if (!session) {
    throw new Error("Unauthorized")
  }

  await connectToDatabase()

  const station = await Station.findOne({
    _id: new mongoose.Types.ObjectId(stationId),
    ...(session.role === "ADMIN" ? {} : { ownerId: new mongoose.Types.ObjectId(session.userId) }),
  })

  if (!station) {
    throw new Error("Station not found or access denied")
  }

  station.name = formData.name.trim()
  station.description = formData.description?.trim()
  station.address = formData.address.trim()
  station.city = formData.city.trim()
  station.state = formData.state.trim()
  station.pincode = formData.pincode.trim()
  if (formData.amenities) station.amenities = formData.amenities
  if (formData.openingHours) station.openingHours = formData.openingHours
  if (formData.status) station.status = formData.status

  await station.save()

  // If charger updates were provided, update primary charger
  if (formData.powerOutput || formData.pricePerKWh || formData.connectorType) {
    const charger = await Charger.findOne({ stationId: station._id })
    if (charger) {
      if (formData.powerOutput) charger.powerOutput = formData.powerOutput
      if (formData.pricePerKWh) charger.pricePerKWh = formData.pricePerKWh
      if (formData.connectorType) charger.connectorType = formData.connectorType as any
      await charger.save()
    }
  }

  return { success: true }
}

export async function deleteStation(stationId: string) {
  const session = await getCurrentSession()
  if (!session) {
    throw new Error("Unauthorized")
  }

  await connectToDatabase()

  const station = await Station.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(stationId),
    ...(session.role === "ADMIN" ? {} : { ownerId: new mongoose.Types.ObjectId(session.userId) }),
  })

  if (!station) {
    throw new Error("Station not found or access denied")
  }

  await Charger.deleteMany({ stationId: station._id })
  return { success: true }
}

