"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStationById } from "@/lib/actions/stations"
import { createBooking } from "@/lib/actions/bookings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, CheckCircle2, ShieldCheck, CreditCard, Clock, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BookStationPage({ params }: PageProps) {
  const router = useRouter()
  const [stationId, setStationId] = useState<string>("")
  const [station, setStation] = useState<any>(null)
  const [selectedChargerId, setSelectedChargerId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "10:00",
    endTime: "11:00",
    specialInstructions: "",
  })

  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [durationHours, setDurationHours] = useState(1)

  useEffect(() => {
    const loadStation = async () => {
      const resolvedParams = await params
      setStationId(resolvedParams.id)

      const stationData = await getStationById(resolvedParams.id)
      if (!stationData) {
        router.push("/user/dashboard")
        return
      }

      setStation(stationData)
      if (stationData.chargers.length > 0) {
        setSelectedChargerId(stationData.chargers[0].id)
      }

      // Default date to today
      const today = new Date().toISOString().split("T")[0]
      setBookingData((prev) => ({ ...prev, date: today }))
    }

    loadStation()
  }, [params, router])

  const selectedCharger = station?.chargers?.find((c: any) => c.id === selectedChargerId)

  useEffect(() => {
    if (bookingData.startTime && bookingData.endTime && selectedCharger) {
      const start = new Date(`2000-01-01T${bookingData.startTime}`)
      const end = new Date(`2000-01-01T${bookingData.endTime}`)

      if (end > start) {
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        setDurationHours(hours)
        // Energy estimated: 75% average utilization of power output
        const estimatedUnits = (selectedCharger.powerOutput * 0.75) * hours
        const cost = Math.round(estimatedUnits * selectedCharger.pricePerKWh)
        setCalculatedPrice(Math.max(100, cost))
      } else {
        setDurationHours(0)
        setCalculatedPrice(0)
      }
    }
  }, [bookingData.startTime, bookingData.endTime, selectedCharger])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!selectedChargerId) {
        throw new Error("Please select a charging bay")
      }

      const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}:00`)
      const endDateTime = new Date(`${bookingData.date}T${bookingData.endTime}:00`)

      if (startDateTime <= new Date()) {
        throw new Error("Booking time must be in the future")
      }

      if (endDateTime <= startDateTime) {
        throw new Error("End time must be after start time")
      }

      const res = await createBooking({
        stationId,
        chargerId: selectedChargerId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        estimatedCost: calculatedPrice,
        notes: bookingData.specialInstructions || undefined,
      })

      if (!res.success) {
        throw new Error(res.error || "Failed to confirm reservation")
      }

      router.push(`/user/bookings/${res.bookingId}/confirmation`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during booking")
    } finally {
      setIsLoading(false)
    }
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading charging station reservation...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-5xl">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href={`/user/stations/${stationId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel & Return
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Reserve Charging Bay</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Reserve Slot: {station.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4 text-primary" />
            {station.address}, {station.city}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Select Slot & Charging Bay</CardTitle>
                <CardDescription>
                  Server-side slot conflict protection guarantees your reserved bay.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Select Charger */}
                  <div className="space-y-2">
                    <Label htmlFor="charger">Charging Bay</Label>
                    <Select value={selectedChargerId} onValueChange={setSelectedChargerId}>
                      <SelectTrigger id="charger" className="h-11">
                        <SelectValue placeholder="Choose a bay" />
                      </SelectTrigger>
                      <SelectContent>
                        {station.chargers.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.identifier} — {c.connectorType} ({c.powerOutput} kW) • {formatCurrency(c.pricePerKWh)}/kWh
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Reservation Date</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={bookingData.date}
                      onChange={(e) => setBookingData((p) => ({ ...p, date: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-11"
                    />
                  </div>

                  {/* Time slots */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        required
                        value={bookingData.startTime}
                        onChange={(e) => setBookingData((p) => ({ ...p, startTime: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        required
                        value={bookingData.endTime}
                        onChange={(e) => setBookingData((p) => ({ ...p, endTime: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Requests / Vehicle Model</Label>
                    <Textarea
                      id="notes"
                      placeholder="e.g. Tata Nexon EV, please keep stall unobstructed..."
                      value={bookingData.specialInstructions}
                      onChange={(e) => setBookingData((p) => ({ ...p, specialInstructions: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading || durationHours <= 0}>
                    {isLoading ? "Validating & Reserving..." : `Pay ${formatCurrency(calculatedPrice)} & Reserve`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Bay:</span>
                  <span className="font-semibold">{selectedCharger?.identifier || "Bay 1"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Connector:</span>
                  <span className="font-semibold">{selectedCharger?.connectorType || "CCS2"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{durationHours.toFixed(1)} hrs</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Tariff:</span>
                  <span className="font-semibold">{formatCurrency(selectedCharger?.pricePerKWh || 18)}/kWh</span>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="font-bold text-base">Estimated Total:</span>
                  <span className="font-bold text-xl text-primary">{formatCurrency(calculatedPrice)}</span>
                </div>

                <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Free cancellation up to 30 min before</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>Instant UPI & NetBanking Checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
