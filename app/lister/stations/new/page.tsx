"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createStation } from "@/lib/actions/stations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Zap, Plus, X } from "lucide-react"

const CONNECTOR_TYPES = ["CCS2", "Type 2", "Bharat AC-001", "Bharat DC-001", "CHAdeMO", "GB/T"]
const COMMON_AMENITIES = ["WiFi", "Restroom", "Coffee Lounge", "Food Court", "24/7 Security", "Covered Canopy", "Tyre Inflation", "CCTV"]

export default function NewStationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "Restroom",
    "WiFi",
    "24/7 Security",
  ])
  const [customAmenity, setCustomAmenity] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "",
    latitude: "12.9716",
    longitude: "77.5946",
    connectorType: "CCS2",
    powerOutput: "60",
    pricePerKWh: "18.5",
    openingHours: "Open 24/7",
    identifier: "Bay 01",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities((prev) => [...prev, customAmenity.trim()])
      setCustomAmenity("")
    }
  }

  const removeAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => prev.filter((a) => a !== amenity))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const lat = Number.parseFloat(formData.latitude) || 12.9716
      const lng = Number.parseFloat(formData.longitude) || 77.5946
      const power = Number.parseFloat(formData.powerOutput) || 60
      const price = Number.parseFloat(formData.pricePerKWh) || 18

      await createStation({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim() || "560001",
        latitude: lat,
        longitude: lng,
        amenities: selectedAmenities,
        openingHours: formData.openingHours,
        chargers: [
          {
            identifier: formData.identifier || "Bay 01",
            connectorType: formData.connectorType,
            chargingSpeed: power >= 120 ? "Ultra-Fast" : power >= 50 ? "Fast" : "Standard",
            powerOutput: power,
            pricePerKWh: price,
          },
        ],
      })

      router.push("/lister/dashboard")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while creating station")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4 max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/lister/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">Deploy EV Charging Hub</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-3xl">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl">Register Infrastructure Site</CardTitle>
            <CardDescription>
              Deploy a new public or private charging station onto the MongoDB Indian grid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold border-b pb-2">Hub Identity & Address</h3>

                <div className="grid gap-2">
                  <Label htmlFor="name">Station Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Jio-bp pulse Fast Charging Hub - Koramangala"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Overview / Directions Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe landmark, parking level, canopy, or entry gates..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    required
                    placeholder="Plot No. 42, 80 Feet Road, 4th Block"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      placeholder="e.g. Bengaluru"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      required
                      placeholder="e.g. Karnataka"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      required
                      placeholder="e.g. 560034"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                    />
                  </div>
                </div>

                {/* GPS Coordinates for MongoDB 2dsphere index */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">Latitude (GPS)</Label>
                    <Input
                      id="latitude"
                      required
                      placeholder="12.9352"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange("latitude", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">Longitude (GPS)</Label>
                    <Input
                      id="longitude"
                      required
                      placeholder="77.6245"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange("longitude", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Charger Bay Specifications */}
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-semibold border-b pb-2">Primary Charging Bay Specifications</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="identifier">Bay Identifier</Label>
                    <Input
                      id="identifier"
                      placeholder="Bay 01 - Gun A"
                      value={formData.identifier}
                      onChange={(e) => handleInputChange("identifier", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="connectorType">Connector Standard</Label>
                    <Select
                      value={formData.connectorType}
                      onValueChange={(val) => handleInputChange("connectorType", val)}
                    >
                      <SelectTrigger id="connectorType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONNECTOR_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="powerOutput">Power Rating (kW)</Label>
                    <Input
                      id="powerOutput"
                      type="number"
                      required
                      min="3"
                      placeholder="60"
                      value={formData.powerOutput}
                      onChange={(e) => handleInputChange("powerOutput", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pricePerKWh">Rate (₹ / kWh)</Label>
                    <Input
                      id="pricePerKWh"
                      type="number"
                      step="0.5"
                      required
                      min="5"
                      placeholder="18.5"
                      value={formData.pricePerKWh}
                      onChange={(e) => handleInputChange("pricePerKWh", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="openingHours">Operating Hours</Label>
                    <Input
                      id="openingHours"
                      placeholder="Open 24/7"
                      value={formData.openingHours}
                      onChange={(e) => handleInputChange("openingHours", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-semibold border-b pb-2">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COMMON_AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-xs font-normal cursor-pointer">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                {isLoading ? "Publishing Station to MongoDB..." : "Publish Charging Station"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
