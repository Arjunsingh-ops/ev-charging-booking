import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, MapPin, Zap, Star, Calendar, User } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserStationDetailsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Verify user type
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (profile?.user_type !== "user") {
    redirect("/lister/dashboard")
  }

  // Fetch station details
  const { data: station, error } = await supabase
    .from("charging_stations")
    .select(`
      *,
      profiles!charging_stations_lister_id_fkey(full_name)
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !station) {
    redirect("/user/dashboard")
  }

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles!reviews_user_id_fkey(full_name)
    `)
    .eq("station_id", id)
    .order("created_at", { ascending: false })

  const averageRating = reviews?.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/user/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{station.name}</span>
            </div>
          </div>
          <Button asChild size="lg">
            <Link href={`/user/stations/${id}/book`}>
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
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
                  <Badge variant="secondary">Available</Badge>
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
                      <span className="font-medium text-lg">${station.price_per_hour}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Hours:</span>
                      <span className="font-medium">
                        {station.availability_start} - {station.availability_end}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Station Owner:</span>
                      <span className="font-medium">{station.profiles?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Rating:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
                        {reviews?.length ? `(${reviews.length})` : ""}
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

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews?.length || 0})</CardTitle>
                <CardDescription>What other EV drivers are saying</CardDescription>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{review.profiles?.full_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-current text-yellow-500" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this station!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Booking</CardTitle>
                <CardDescription>Reserve your charging session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">${station.price_per_hour}</div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Power Output:</span>
                    <span className="font-medium">{station.power_output} kW</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connector:</span>
                    <span className="font-medium">{station.connector_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span className="font-medium">
                      {station.availability_start} - {station.availability_end}
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href={`/user/stations/${id}/book`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book This Station
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimated Charging Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>0-80% (typical):</span>
                  <span className="font-medium">~45 min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Full charge:</span>
                  <span className="font-medium">~1.5 hours</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  *Estimates based on {station.power_output}kW output. Actual time varies by vehicle.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
