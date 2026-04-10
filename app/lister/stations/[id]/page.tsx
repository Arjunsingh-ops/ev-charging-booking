import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, MapPin, Zap, Edit, Calendar, DollarSign, Star } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StationDetailsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch station details
  const { data: station, error } = await supabase
    .from("charging_stations")
    .select("*")
    .eq("id", id)
    .eq("lister_id", user.id)
    .single()

  if (error || !station) {
    redirect("/lister/dashboard")
  }

  // Fetch station bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      profiles!bookings_user_id_fkey(full_name)
    `)
    .eq("station_id", id)
    .order("created_at", { ascending: false })

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles!reviews_user_id_fkey(full_name)
    `)
    .eq("station_id", id)
    .order("created_at", { ascending: false })

  const totalBookings = bookings?.length || 0
  const completedBookings = bookings?.filter((b) => b.status === "completed")?.length || 0
  const totalRevenue =
    bookings
      ?.filter((b) => b.status === "completed")
      ?.reduce((sum, b) => sum + Number.parseFloat(b.total_price || "0"), 0) || 0
  const averageRating = reviews?.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/lister/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{station.name}</span>
            </div>
          </div>
          <Button asChild>
            <Link href={`/lister/stations/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Station
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Station Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{station.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4" />
                      {station.address}, {station.city}, {station.state} {station.zip_code}
                    </CardDescription>
                  </div>
                  <Badge variant={station.is_active ? "default" : "secondary"}>
                    {station.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {station.description && <p className="text-muted-foreground">{station.description}</p>}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connector Type:</span>
                      <span className="font-medium">{station.connector_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Power Output:</span>
                      <span className="font-medium">{station.power_output} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per Hour:</span>
                      <span className="font-medium">${station.price_per_hour}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available From:</span>
                      <span className="font-medium">{station.availability_start}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Until:</span>
                      <span className="font-medium">{station.availability_end}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Rating:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
                      </span>
                    </div>
                  </div>
                </div>

                {station.amenities && station.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {station.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest reservations for this station</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.start_time).toLocaleDateString()} at{" "}
                            {new Date(booking.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              booking.status === "completed"
                                ? "default"
                                : booking.status === "confirmed"
                                  ? "secondary"
                                  : booking.status === "cancelled"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {booking.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground">${booking.total_price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No bookings yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Station Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Bookings</span>
                  </div>
                  <span className="font-bold">{totalBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-bold">{completedBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Revenue</span>
                  </div>
                  <span className="font-bold">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reviews</span>
                  </div>
                  <span className="font-bold">{reviews?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{review.profiles?.full_name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating ? "fill-current text-yellow-500" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
