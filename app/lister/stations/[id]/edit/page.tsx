"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStationById, updateStation, deleteStation } from "@/lib/actions/stations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { ArrowLeft, Save, Trash2, Zap } from "lucide-react"

const CONNECTOR_TYPES = ["CCS2", "Type 2", "Bharat AC-001", "Bharat DC-001", "CHAdeMO", "GB/T"]
const COMMON_AMENITIES = ["WiFi", "Restroom", "Coffee Lounge", "Food Court", "24/7 Security", "Covered Canopy", "Tyre Inflation", "CCTV"]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditStationPage({ params }: PageProps) {
  const router = useRouter()
  const [stationId, setStationId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    connectorType: "CCS2",
    powerOutput: "60",
    pricePerKWh: "18.5",
    openingHours: "Open 24/7",
    isActive: true,
  })

  useEffect(() => {
    const loadStation = async () => {
      const resolvedParams = await params
      setStationId(resolvedParams.id)

      const station = await getStationById(resolvedParams.id)
      if (!station) {
        router.push("/lister/dashboard")
        return
      }

      const primary = station.chargers[0]

      setFormData({
        name: station.name || "",
        description: station.description || "",
        address: station.address || "",
        city: station.city || "",
        state: station.state || "",
        pincode: station.pincode || "",
        connectorType: primary?.connectorType || "CCS2",
        powerOutput: primary?.powerOutput ? primary.powerOutput.toString() : "60",
        pricePerKWh: primary?.pricePerKWh ? primary.pricePerKWh.toString() : "18.5",
        openingHours: station.openingHours || "Open 24/7",
        isActive: station.status === "active",
      })

      setSelectedAmenities(station.amenities || [])
    }

    loadStation()
  }, [params, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await updateStation(stationId, {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        amenities: selectedAmenities,
        openingHours: formData.openingHours,
        status: formData.isActive ? "active" : "inactive",
        powerOutput: Number(formData.powerOutput),
        pricePerKWh: Number(formData.pricePerKWh),
        connectorType: formData.connectorType,
      })

      router.push(`/lister/stations/${stationId}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update station")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this station and all its charging bays from the grid?")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteStation(stationId)
      router.push("/lister/dashboard")
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete station")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href={`/lister/stations/${stationId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">Configure Station</span>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Removing..." : "Delete Station"}
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-3xl">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl">Edit Station & Tariff</CardTitle>
            <CardDescription>Update your EV charging hub parameters and connector details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="active-toggle" className="font-semibold text-base">Operational Status</Label>
                  <p className="text-xs text-muted-foreground">When active, drivers can discover and reserve bays.</p>
                </div>
                <Switch
                  id="active-toggle"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>

              {/* Station Info */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Station Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Overview Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    required
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
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      required
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      required
                      value={formData.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Charger Specs */}
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-base font-semibold">Primary Charging Bay</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="connectorType">Connector</Label>
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

                  <div className="grid gap-2">
                    <Label htmlFor="powerOutput">Power (kW)</Label>
                    <Input
                      id="powerOutput"
                      type="number"
                      required
                      value={formData.powerOutput}
                      onChange={(e) => handleInputChange("powerOutput", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="pricePerKWh">Rate (₹/kWh)</Label>
                    <Input
                      id="pricePerKWh"
                      type="number"
                      step="0.5"
                      required
                      value={formData.pricePerKWh}
                      onChange={(e) => handleInputChange("pricePerKWh", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="openingHours">Operating Hours</Label>
                  <Input
                    id="openingHours"
                    value={formData.openingHours}
                    onChange={(e) => handleInputChange("openingHours", e.target.value)}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3 pt-2 border-t">
                <h3 className="text-base font-semibold">Amenities</h3>
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
                {isLoading ? "Saving changes..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
