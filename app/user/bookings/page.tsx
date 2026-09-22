import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getUserBookings } from "@/lib/actions/bookings"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Clock, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function UserBookingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login?redirect=/user/bookings")
  }

  const bookings = await getUserBookings()

  const upcomingBookings = bookings.filter(
    (b) => (b.status === "CONFIRMED" || b.status === "PENDING") && new Date(b.startTime) > new Date()
  )

  const pastBookings = bookings.filter(
    (b) => b.status === "COMPLETED" || (b.status !== "CANCELLED" && new Date(b.startTime) <= new Date())
  )

  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED")

  const renderBookingCard = (booking: (typeof bookings)[0]) => (
    <Card key={booking.id} className="border-border hover:border-primary/40 transition">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{booking.stationName}</h3>
              <Badge
                variant="outline"
                className={
                  booking.status === "COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : booking.status === "CONFIRMED"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : booking.status === "CANCELLED"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-muted text-muted-foreground"
                }
              >
                {booking.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {booking.stationAddress}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-primary" />
                {booking.chargerBay} ({booking.connectorType}, {booking.powerOutput} kW)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(booking.startTime).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date(booking.startTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0">
            <div className="text-right">
              <div className="font-bold text-lg">{formatCurrency(booking.finalCost)}</div>
              <div className="text-xs text-muted-foreground">
                Payment: {booking.paymentStatus === "completed" ? "Paid (UPI)" : booking.paymentStatus}
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/user/bookings/${booking.id}/confirmation`}>
                View Slip
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-5xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/user/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold tracking-tight">Charging Reservations</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-5xl">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Completed & Past ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(renderBookingCard)
            ) : (
              <div className="text-center py-16 border rounded-lg border-dashed">
                <p className="text-muted-foreground text-sm">No upcoming charging reservations.</p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/user/dashboard">Discover & Book a Bay</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map(renderBookingCard)
            ) : (
              <div className="text-center py-16 border rounded-lg border-dashed">
                <p className="text-muted-foreground text-sm">No past sessions on record.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map(renderBookingCard)
            ) : (
              <div className="text-center py-16 border rounded-lg border-dashed">
                <p className="text-muted-foreground text-sm">No cancelled reservations.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
