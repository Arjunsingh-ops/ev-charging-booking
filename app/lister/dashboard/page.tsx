import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Zap, MapPin, Calendar, DollarSign, TrendingUp, Clock, Plus, Eye, Edit } from "lucide-react"

export default async function ListerDashboard() {
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

  if (profile?.user_type !== "lister") {
    redirect("/user/dashboard")
  }

  const { data: stations } = await supabase
    .from("charging_stations")
    .select("*")
    .eq("lister_id", data.user.id)
    .order("created_at", { ascending: false })

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      charging_stations!inner(name, lister_id),
      profiles!bookings_user_id_fkey(full_name)
    `)
    .eq("charging_stations.lister_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Calculate stats
  const totalStations = stations?.length || 0
  const activeStations = stations?.filter((s) => s.is_active)?.length || 0
  const totalBookings = bookings?.length || 0
  const completedBookings = bookings?.filter((b) => b.status === "completed")?.length || 0
  const totalRevenue =
    bookings
      ?.filter((b) => b.status === "completed")
      ?.reduce((sum, b) => sum + Number.parseFloat(b.total_price || "0"), 0) || 0

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
            <Button asChild>
              <Link href="/lister/stations/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Station
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStations}</div>
              <p className="text-xs text-muted-foreground">{activeStations} active</p>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From completed bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${completedBookings > 0 ? (totalRevenue / completedBookings).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Per booking</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stations">My Stations</TabsTrigger>
            <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your charging station business</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start">
                    <Link href="/lister/stations/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Station
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                    <Link href="/lister/stations">
                      <MapPin className="mr-2 h-4 w-4" />
                      Manage Stations
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                    <Link href="/lister/bookings">
                      <Calendar className="mr-2 h-4 w-4" />
                      View All Bookings
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest bookings and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings && bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{booking.profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{booking.charging_stations?.name}</p>
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
                    <p className="text-muted-foreground">No recent bookings</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Charging Stations</h2>
              <Button asChild>
                <Link href="/lister/stations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Station
                </Link>
              </Button>
            </div>

            {stations && stations.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stations.map((station) => (
                  <Card key={station.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{station.name}</CardTitle>
                          <CardDescription>
                            {station.city}, {station.state}
                          </CardDescription>
                        </div>
                        <Badge variant={station.is_active ? "default" : "secondary"}>
                          {station.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Connector:</span>
                          <span>{station.connector_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Power:</span>
                          <span>{station.power_output} kW</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span>${station.price_per_hour}/hour</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
                          <Link href={`/lister/stations/${station.id}`}>
                            <Eye className="mr-2 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
                          <Link href={`/lister/stations/${station.id}/edit`}>
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No stations yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first charging station to start earning revenue</p>
                  <Button asChild>
                    <Link href="/lister/stations/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Station
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Bookings</h2>

            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{booking.profiles?.full_name}</h3>
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
                            {booking.charging_stations?.name}
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
                          <p className="font-semibold">${booking.total_price}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(
                              (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) /
                                (1000 * 60 * 60),
                            )}
                            h session
                          </p>
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
                  <p className="text-muted-foreground">
                    Bookings will appear here once customers start reserving your stations
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
