import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Zap, MapPin, Calendar, Clock, Search, Filter, Navigation, Bookmark } from "lucide-react"

export default async function UserDashboard() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify user type
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, full_name")
    .eq("id", data.user.id)
    .single()

  if (profile?.user_type !== "user") {
    redirect("/lister/dashboard")
  }

  const { data: stations } = await supabase
    .from("charging_stations")
    .select(`
      *,
      profiles!charging_stations_lister_id_fkey(full_name)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  const { data: userBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      charging_stations(name, city, state, connector_type)
    `)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Calculate user stats
  const totalBookings = userBookings?.length || 0
  const completedBookings = userBookings?.filter((b) => b.status === "completed")?.length || 0
  const upcomingBookings =
    userBookings?.filter((b) => b.status === "confirmed" && new Date(b.start_time) > new Date())?.length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ChargeConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {profile?.full_name}</span>
            <Button asChild variant="outline">
              <Link href="/user/bookings">My Bookings</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">{completedBookings} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Stations</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Saved for later</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList>
            <TabsTrigger value="discover">Discover Stations</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Find Charging Stations</CardTitle>
                <CardDescription>Search for available EV charging stations in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search by city, address, or station name..." className="pl-10" />
                    </div>
                  </div>
                  <Select>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Connector Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Type 1">Type 1</SelectItem>
                      <SelectItem value="Type 2">Type 2</SelectItem>
                      <SelectItem value="CCS">CCS</SelectItem>
                      <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                      <SelectItem value="Tesla">Tesla</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="Power" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Power</SelectItem>
                      <SelectItem value="fast">50+ kW</SelectItem>
                      <SelectItem value="rapid">100+ kW</SelectItem>
                      <SelectItem value="ultra">150+ kW</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Filter className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Stations */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Available Stations</h2>

              {stations && stations.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stations.map((station) => (
                    <Card key={station.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{station.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {station.city}, {station.state}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">Available</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Connector:</span>
                            <span className="font-medium">{station.connector_type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Power Output:</span>
                            <span className="font-medium">{station.power_output} kW</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-medium">${station.price_per_hour}/hour</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Owner:</span>
                            <span className="font-medium">{station.profiles?.full_name}</span>
                          </div>

                          {station.amenities && station.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {station.amenities.slice(0, 3).map((amenity, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" asChild className="flex-1">
                              <Link href={`/user/stations/${station.id}`}>View Details</Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
                              <Link href={`/user/stations/${station.id}/book`}>Book Now</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No stations found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria or check back later</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <Button asChild variant="outline">
                <Link href="/user/bookings">View All</Link>
              </Button>
            </div>

            {userBookings && userBookings.length > 0 ? (
              <div className="space-y-4">
                {userBookings.slice(0, 5).map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{booking.charging_stations?.name}</h3>
                            <Badge
                              variant={
                                booking.status === "completed"
                                  ? "default"
                                  : booking.status === "confirmed"
                                    ? "secondary"
                                    : booking.status === "in_progress"
                                      ? "outline"
                                      : booking.status === "cancelled"
                                        ? "destructive"
                                        : "outline"
                              }
                            >
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
                          <p className="text-sm text-muted-foreground">
                            <Zap className="inline h-3 w-3 mr-1" />
                            {booking.charging_stations?.connector_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${booking.total_price}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(
                              (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) /
                                (1000 * 60 * 60),
                            )}
                            h session
                          </p>
                          {booking.status === "confirmed" && new Date(booking.start_time) > new Date() && (
                            <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-4">Start by finding and booking your first charging station</p>
                  <Button asChild>
                    <Link href="#discover">
                      <Search className="mr-2 h-4 w-4" />
                      Find Stations
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nearby" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Nearby Stations</h2>
              <Button variant="outline">
                <Navigation className="mr-2 h-4 w-4" />
                Use My Location
              </Button>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Location Access Required</h3>
                <p className="text-muted-foreground mb-4">Enable location access to find charging stations near you</p>
                <Button>
                  <Navigation className="mr-2 h-4 w-4" />
                  Enable Location
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
