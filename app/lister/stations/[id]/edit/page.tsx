"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
import { ArrowLeft, MapPin, Zap, Clock, Save, X } from "lucide-react"

const CONNECTOR_TYPES = ["Type 1", "Type 2", "CCS", "CHAdeMO", "Tesla"]
const COMMON_AMENITIES = ["WiFi", "Restroom", "Food", "Shopping", "Parking", "24/7 Access", "Covered", "Security"]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditStationPage({ params }: PageProps) {
  const router = useRouter()
  const [stationId, setStationId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [customAmenity, setCustomAmenity] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    connector_type: "",
    power_output: "",
    price_per_hour: "",
    availability_start: "00:00",
    availability_end: "23:59",
    is_active: true,
  })

  useEffect(() => {
    const loadStation = async () => {
      const resolvedParams = await params
      setStationId(resolvedParams.id)

      const supabase = createClient()
      const { data: station, error } = await supabase
        .from("charging_stations")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

      if (error || !station) {
        router.push("/lister/dashboard")
        return
      }

      setFormData({
        name: station.name,
        description: station.description || "",
        address: station.address,
        city: station.city,
        state: station.state,
        zip_code: station.zip_code,
        connector_type: station.connector_type,
        power_output: station.power_output.toString(),
        price_per_hour: station.price_per_hour.toString(),
        availability_start: station.availability_start,
        availability_end: station.availability_end,
        is_active: station.is_active,
      })
      setSelectedAmenities(station.amenities || [])
    }

    loadStation()
  }, [params, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
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

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from("charging_stations")
        .update({
          name: formData.name,
          description: formData.description || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          connector_type: formData.connector_type,
          power_output: Number.parseInt(formData.power_output),
          price_per_hour: Number.parseFloat(formData.price_per_hour),
          availability_start: formData.availability_start,
          availability_end: formData.availability_end,
          amenities: selectedAmenities,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", stationId)

      if (updateError) throw updateError

      router.push(`/lister/stations/${stationId}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/lister/stations/${stationId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Station
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Edit Station</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Edit Charging Station
            </CardTitle>
            <CardDescription>Update your station details and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Station Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Station Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active ? "Station is active and accepting bookings" : "Station is inactive"}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Basic Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Station Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="connector_type">Connector Type *</Label>
                    <Select
                      value={formData.connector_type}
                      onValueChange={(value) => handleInputChange("connector_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONNECTOR_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code *</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Technical Specifications
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="power_output">Power Output (kW) *</Label>
                    <Input
                      id="power_output"
                      type="number"
                      min="1"
                      max="350"
                      value={formData.power_output}
                      onChange={(e) => handleInputChange("power_output", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_per_hour">Price per Hour ($) *</Label>
                    <Input
                      id="price_per_hour"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_per_hour}
                      onChange={(e) => handleInputChange("price_per_hour", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Availability Hours
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability_start">Available From</Label>
                    <Input
                      id="availability_start"
                      type="time"
                      value={formData.availability_start}
                      onChange={(e) => handleInputChange("availability_start", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability_end">Available Until</Label>
                    <Input
                      id="availability_end"
                      type="time"
                      value={formData.availability_end}
                      onChange={(e) => handleInputChange("availability_end", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COMMON_AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom amenity"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAmenity())}
                  />
                  <Button type="button" variant="outline" onClick={addCustomAmenity}>
                    Add
                  </Button>
                </div>

                {selectedAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAmenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeAmenity(amenity)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Saving Changes..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href={`/lister/stations/${stationId}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
