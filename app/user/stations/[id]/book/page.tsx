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
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BookStationPage({ params }: PageProps) {
  const router = useRouter()
  const [stationId, setStationId] = useState<string>("")
  const [station, setStation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    specialInstructions: "",
  })

  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const loadStation = async () => {
      const resolvedParams = await params
      setStationId(resolvedParams.id)

      const supabase = createClient()
      const { data: stationData, error } = await supabase
        .from("charging_stations")
        .select(`
          *,
          profiles!charging_stations_lister_id_fkey(full_name)
        `)
        .eq("id", resolvedParams.id)
        .eq("is_active", true)
        .single()

      if (error || !stationData) {
        router.push("/user/dashboard")
        return
      }

      setStation(stationData)

      // Set default date to today
      const today = new Date().toISOString().split("T")[0]
      setBookingData((prev) => ({ ...prev, date: today }))
    }

    loadStation()
  }, [params, router])

  useEffect(() => {
    if (bookingData.startTime && bookingData.endTime && station) {
      const start = new Date(`2000-01-01T${bookingData.startTime}`)
      const end = new Date(`2000-01-01T${bookingData.endTime}`)

      if (end > start) {
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        setDuration(durationHours)
        setCalculatedPrice(durationHours * Number.parseFloat(station.price_per_hour))
      } else {
        setDuration(0)
        setCalculatedPrice(0)
      }
    }
  }, [bookingData.startTime, bookingData.endTime, station])

  const handleInputChange = (field: string, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Validate booking time
      const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}`)
      const endDateTime = new Date(`${bookingData.date}T${bookingData.endTime}`)

      if (startDateTime <= new Date()) {
        throw new Error("Booking time must be in the future")
      }

      if (endDateTime <= startDateTime) {
        throw new Error("End time must be after start time")
      }

      // Check for conflicts
      const { data: conflicts } = await supabase
        .from("bookings")
        .select("id")
        .eq("station_id", stationId)
        .in("status", ["confirmed", "in_progress"])
        .or(
          `and(start_time.lte.${startDateTime.toISOString()},end_time.gt.${startDateTime.toISOString()}),and(start_time.lt.${endDateTime.toISOString()},end_time.gte.${endDateTime.toISOString()}),and(start_time.gte.${startDateTime.toISOString()},end_time.lte.${endDateTime.toISOString()})`,
        )

      if (conflicts && conflicts.length > 0) {
        throw new Error("This time slot is already booked. Please choose a different time.")
      }

      const { data: booking, error: insertError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          station_id: stationId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          total_price: calculatedPrice.toFixed(2),
          special_instructions: bookingData.specialInstructions || null,
          status: "confirmed",
          payment_status: "paid", // In a real app, this would be handled by payment processing
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/user/bookings/${booking.id}/confirmation`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!station) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/user/stations/${stationId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Station
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Book Charging Session</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Reserve Your Charging Session</CardTitle>
                <CardDescription>Select your preferred date and time for charging at {station.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Date & Time</h3>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={bookingData.startTime}
                          onChange={(e) => handleInputChange("startTime", e.target.value)}
                          min={station.availability_start}
                          max={station.availability_end}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time *</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={bookingData.endTime}
                          onChange={(e) => handleInputChange("endTime", e.target.value)}
                          min={station.availability_start}
                          max={station.availability_end}
                          required
                        />
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Station is available from {station.availability_start} to {station.availability_end}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                      <Textarea
                        id="specialInstructions"
                        value={bookingData.specialInstructions}
                        onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                        placeholder="Any special requests or instructions for the station owner..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

                  <Button type="submit" disabled={isLoading || calculatedPrice === 0} className="w-full" size="lg">
                    {isLoading ? "Processing Booking..." : `Confirm Booking - $${calculatedPrice.toFixed(2)}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Station Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{station.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {station.city}, {station.state}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Connector:</span>
                    <span className="font-medium">{station.connector_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power:</span>
                    <span className="font-medium">{station.power_output} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="font-medium">${station.price_per_hour}/hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookingData.date && (
                  <div className="flex justify-between text-sm">
                    <span>Date:</span>
                    <span className="font-medium">{new Date(bookingData.date).toLocaleDateString()}</span>
                  </div>
                )}

                {bookingData.startTime && bookingData.endTime && (
                  <div className="flex justify-between text-sm">
                    <span>Time:</span>
                    <span className="font-medium">
                      {bookingData.startTime} - {bookingData.endTime}
                    </span>
                  </div>
                )}

                {duration > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span className="font-medium">{duration} hours</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-xl font-bold text-primary">${calculatedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Booking Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Free cancellation up to 1 hour before your session</p>
                <p>• Late arrivals may result in reduced session time</p>
                <p>• Payment is processed immediately upon booking</p>
                <p>• Please arrive on time to maximize your charging session</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
