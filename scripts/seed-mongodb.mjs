import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chargeconnect"
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "chargeconnect"

async function seed() {
  console.log("🔌 Connecting to MongoDB:", MONGODB_URI)
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME })
  console.log(" Connected to MongoDB successfully.")

  const db = mongoose.connection.db

  // Clear existing collections
  console.log(" Clearing old collections...")
  const collections = ["users", "vehicles", "stations", "chargers", "bookings", "chargingsessions", "payments", "reviews", "notifications"]
  for (const c of collections) {
    try {
      await db.collection(c).drop()
    } catch {
      // ignore if collection doesn't exist
    }
  }

  // Create password hash
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash("password123", salt)

  // 1. Seed Users
  console.log(" Creating users...")
  const driverUser = await db.collection("users").insertOne({
    name: "Arjun Verma",
    email: "user@example.com",
    phone: "+91 98765 43210",
    passwordHash,
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const ownerUser = await db.collection("users").insertOne({
    name: "Sunil Hegde (ChargeZone Partners)",
    email: "owner@example.com",
    phone: "+91 98450 12345",
    passwordHash,
    role: "STATION_OWNER",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // 2. Seed Vehicle
  console.log(" Creating vehicles...")
  await db.collection("vehicles").insertOne({
    userId: driverUser.insertedId,
    make: "Tata",
    model: "Nexon EV",
    variant: "Empowered LR",
    registrationNumber: "KA 01 MJ 4082",
    batteryCapacity: 40.5,
    connectorTypes: ["CCS2", "Type 2"],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // 3. Seed Realistic Indian Stations
  console.log(" Creating realistic Indian charging stations...")
  const stationsData = [
    {
      ownerId: ownerUser.insertedId,
      name: "Zeon Fast Charging Hub - Koramangala 4th Block",
      description: "Ultra-fast multi-bay EV charging hub situated in Koramangala near Sony World Junction. Equipped with liquid-cooled DC fast chargers and 24/7 cafe lounge.",
      address: "80 Feet Road, 4th Block, Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      location: {
        type: "Point",
        coordinates: [77.6245, 12.9352], // [lng, lat]
      },
      photos: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800"],
      amenities: ["Restroom", "Coffee Shop", "WiFi", "24/7 Security", "Covered Canopy", "Tyre Air"],
      openingHours: "Open 24/7",
      status: "active",
      rating: 4.8,
      totalRatings: 142,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: ownerUser.insertedId,
      name: "Tata Power EZ Charge - DLF CyberCity",
      description: "Dedicated corporate and commuter charging plaza located in CyberCity Phase 2. High reliability dual gun DC fast charging with valet queue management.",
      address: "Building 10, DLF CyberCity, Phase 2",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122002",
      location: {
        type: "Point",
        coordinates: [77.0878, 28.4950],
      },
      photos: ["https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&q=80&w=800"],
      amenities: ["Food Court", "Restroom", "24/7 Security", "ATM"],
      openingHours: "Open 24/7",
      status: "active",
      rating: 4.6,
      totalRatings: 98,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: ownerUser.insertedId,
      name: "Statiq HyperHub - BKC G Block",
      description: "Premier high-speed charging facility inside Mumbai's business district. High-output chargers compatible with all Indian 4-wheeler EVs.",
      address: "Bandra Kurla Complex, G Block, Behind MCA",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
      location: {
        type: "Point",
        coordinates: [72.8687, 19.0664],
      },
      photos: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800"],
      amenities: ["Shopping Mall Nearby", "Waiting Lounge", "WiFi", "Restroom"],
      openingHours: "06:00 AM - 11:30 PM",
      status: "active",
      rating: 4.9,
      totalRatings: 215,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: ownerUser.insertedId,
      name: "Jio-bp pulse Station - HITEC City",
      description: "Conveniently located charging plaza at Mindspace circle for IT corridor commuters. Features CCS2 DC fast chargers and Bharat AC standard points.",
      address: "Mindspace IT Park, Main Road, HITEC City",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500081",
      location: {
        type: "Point",
        coordinates: [78.3772, 17.4474],
      },
      photos: ["https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800"],
      amenities: ["Convenience Store", "Coffee", "Restroom", "Tyre Inflation"],
      openingHours: "Open 24/7",
      status: "active",
      rating: 4.7,
      totalRatings: 84,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: ownerUser.insertedId,
      name: "ChargeZone SuperHub - Shivaji Nagar",
      description: "Centrally placed EV charging hub in Pune offering rapid charging along FC Road corridor. Ideal for city transit and weekend travellers.",
      address: "FC Road Extension, Shivaji Nagar",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411005",
      location: {
        type: "Point",
        coordinates: [73.8523, 18.5314],
      },
      photos: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800"],
      amenities: ["Restroom", "Snacks Corner", "Covered Parking"],
      openingHours: "Open 24/7",
      status: "active",
      rating: 4.5,
      totalRatings: 67,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: ownerUser.insertedId,
      name: "Ather Grid & Fast Point - Indiranagar",
      description: "Popular multi-standard EV charging stop right off 100ft road. Supports all CCS2 electric cars as well as Type 2 AC charging.",
      address: "100 Feet Rd, HAL 2nd Stage, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "500038",
      location: {
        type: "Point",
        coordinates: [77.6412, 12.9719],
      },
      photos: ["https://images.unsplash.com/photo-1558441719-8b449c6ff673?auto=format&fit=crop&q=80&w=800"],
      amenities: ["Cafes Nearby", "Restroom", "WiFi"],
      openingHours: "07:00 AM - 11:00 PM",
      status: "active",
      rating: 4.7,
      totalRatings: 112,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const insertedStations = await db.collection("stations").insertMany(stationsData)
  const stationIdList = Object.values(insertedStations.insertedIds)

  // 4. Seed Chargers for each station
  console.log(" Creating chargers with realistic Indian pricing and speeds...")
  const chargersList = [
    // Zeon Koramangala
    {
      stationId: stationIdList[0],
      identifier: "Bay 01 - Gun A",
      connectorType: "CCS2",
      chargingSpeed: "Ultra-Fast",
      powerOutput: 120,
      pricePerKWh: 19.5,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      stationId: stationIdList[0],
      identifier: "Bay 01 - Gun B",
      connectorType: "CCS2",
      chargingSpeed: "Fast",
      powerOutput: 60,
      pricePerKWh: 18.0,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      stationId: stationIdList[0],
      identifier: "Bay 02 - AC Gun",
      connectorType: "Type 2",
      chargingSpeed: "Standard",
      powerOutput: 22,
      pricePerKWh: 14.0,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Tata DLF CyberCity
    {
      stationId: stationIdList[1],
      identifier: "CyberBay 1 (CCS2)",
      connectorType: "CCS2",
      chargingSpeed: "Fast",
      powerOutput: 60,
      pricePerKWh: 18.5,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      stationId: stationIdList[1],
      identifier: "CyberBay 2 (Type 2)",
      connectorType: "Type 2",
      chargingSpeed: "Standard",
      powerOutput: 7.4,
      pricePerKWh: 13.5,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Statiq BKC
    {
      stationId: stationIdList[2],
      identifier: "BKC HyperGun 1",
      connectorType: "CCS2",
      chargingSpeed: "Ultra-Fast",
      powerOutput: 150,
      pricePerKWh: 21.0,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      stationId: stationIdList[2],
      identifier: "BKC Bay 2",
      connectorType: "CCS2",
      chargingSpeed: "Fast",
      powerOutput: 60,
      pricePerKWh: 19.0,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Jio-bp HITEC City
    {
      stationId: stationIdList[3],
      identifier: "Jio Bay 01 (Dual Gun)",
      connectorType: "CCS2",
      chargingSpeed: "Fast",
      powerOutput: 60,
      pricePerKWh: 17.5,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      stationId: stationIdList[3],
      identifier: "Jio Bay 02 (Bharat DC)",
      connectorType: "Bharat DC-001",
      chargingSpeed: "Standard",
      powerOutput: 15,
      pricePerKWh: 14.0,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // ChargeZone Pune
    {
      stationId: stationIdList[4],
      identifier: "Pune Gun 1",
      connectorType: "CCS2",
      chargingSpeed: "Fast",
      powerOutput: 60,
      pricePerKWh: 18.0,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Ather Indiranagar
    {
      stationId: stationIdList[5],
      identifier: "Indiranagar Gun A",
      connectorType: "CCS2",
      chargingSpeed: "Fast",
      powerOutput: 50,
      pricePerKWh: 18.5,
      status: "available",
      availability: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const insertedChargers = await db.collection("chargers").insertMany(chargersList)
  const chargerIdList = Object.values(insertedChargers.insertedIds)

  // 5. Create 2dsphere index for location queries
  console.log(" Creating 2dsphere geospatial index...")
  await db.collection("stations").createIndex({ location: "2dsphere" })
  await db.collection("stations").createIndex({ city: 1, status: 1 })
  await db.collection("chargers").createIndex({ stationId: 1, status: 1 })
  await db.collection("bookings").createIndex({ chargerId: 1, startTime: 1, endTime: 1 })

  // 6. Seed Sample Bookings
  console.log(" Creating sample bookings...")
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  await db.collection("bookings").insertOne({
    userId: driverUser.insertedId,
    stationId: stationIdList[0],
    chargerId: chargerIdList[0],
    startTime: new Date(yesterday.getTime() + 10 * 3600000),
    endTime: new Date(yesterday.getTime() + 11 * 3600000),
    status: "COMPLETED",
    estimatedCost: 585,
    finalCost: 585,
    paymentStatus: "completed",
    notes: "Top up session 20% to 80%",
    createdAt: yesterday,
    updatedAt: yesterday,
  })

  await db.collection("bookings").insertOne({
    userId: driverUser.insertedId,
    stationId: stationIdList[0],
    chargerId: chargerIdList[1],
    startTime: new Date(tomorrow.getTime() + 14 * 3600000),
    endTime: new Date(tomorrow.getTime() + 15 * 3600000),
    status: "CONFIRMED",
    estimatedCost: 450,
    finalCost: 450,
    paymentStatus: "completed",
    notes: "Afternoon express charge reservation",
    createdAt: now,
    updatedAt: now,
  })

  // 7. Seed Reviews
  console.log(" Creating sample reviews...")
  await db.collection("reviews").insertOne({
    stationId: stationIdList[0],
    userId: driverUser.insertedId,
    rating: 5,
    comment: "Excellent 120kW charging speed for my Nexon EV Max. Lounge has great coffee and air conditioning.",
    createdAt: yesterday,
    updatedAt: yesterday,
  })

  console.log(" MongoDB Seed Finished Successfully!")
  console.log("-----------------------------------------")
  console.log("Credentials:")
  console.log(" EV Driver:     user@example.com  / password123")
  console.log(" Station Owner: owner@example.com / password123")
  console.log("-----------------------------------------")

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
