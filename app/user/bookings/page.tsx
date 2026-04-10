import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Clock, Zap, Search } from "lucide-react"

export default async function UserBookingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Verify user type
  const { data: profile } = await supabase.from("profiles").select("user_type, full_name").eq("id", user.id).single()

  if (profile?.user_type !== "user") {
    redirect("/lister/dashboard")
  }

  // Fetch all user bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      charging_stations(name, city, state, connector_type, power_output)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const upcomingBookings =
    bookings?.filter((b) => b.status === "confirmed" && new Date(b.start_time) > new Date()) || []

  const pastBookings = bookings?.filter((b) => b.status === "completed" || new Date(b.start_time) <= new Date()) || []

  const cancelledBookings = bookings?.filter((b) => b.status === "cancelled") || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/user/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">My Bookings</span>
            </div>
          </div>
          <Button asChild>
            <Link href="/user/dashboard">
              <Search className="h-4 w-4 mr-2" />
              Find Stations
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{booking.charging_stations?.name}</h3>
                          <Badge variant="secondary">{booking.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {booking.charging_stations?.city}, {booking.charging_stations?.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(booking.start_time).toLocaleDateString()} at{" "}
                          {new Date(booking.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Zap className="inline h-3 w-3 mr-1" />
                          {booking.charging_stations?.connector_type} • {booking.charging_stations?.power_output} kW
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-semibold">${booking.total_price}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(
                            (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) /
                              (1000 * 60 * 60),
                          )}
                          h session
                        </p>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          Cancel Booking
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground mb-4">Book your next charging session to see it here</p>
                  <Button asChild>
                    <Link href="/user/dashboard">
                      <Search className="mr-2 h-4 w-4" />
                      Find Charging Stations
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{booking.charging_stations?.name}</h3>
                          <Badge variant={booking.status === "completed" ? "default" : "outline"}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {booking.charging_stations?.city}, {booking.charging_stations?.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(booking.start_time).toLocaleDateString()} at{" "}
                          {new Date(booking.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-semibold">${booking.total_price}</p>
                        {booking.status === "completed" && (
                          <Button size="sm" variant="outline" className="bg-transparent">
                            Write Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No past bookings</h3>
                  <p className="text-muted-foreground">Your completed charging sessions will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{booking.charging_stations?.name}</h3>
                          <Badge variant="destructive">{booking.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {booking.charging_stations?.city}, {booking.charging_stations?.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(booking.start_time).toLocaleDateString()} at{" "}
                          {new Date(booking.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-muted-foreground">${booking.total_price}</p>
                        <p className="text-sm text-muted-foreground">Refunded</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No cancelled bookings</h3>
                  <p className="text-muted-foreground">Cancelled bookings will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
