import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStations } from "@/lib/actions/stations"
import { getUserBookings } from "@/lib/actions/bookings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Zap, MapPin, Calendar, Clock, Search, Bookmark, History, LogOut } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { DiscoveryMap } from "@/components/discovery-map"

export default async function UserDashboard() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  if (user.role === "STATION_OWNER") {
    redirect("/lister/dashboard")
  }

  const stations = await getStations()
  const userBookings = await getUserBookings()

  // Calculate user stats
  const totalBookings = userBookings.length
  const completedBookings = userBookings.filter((b) => b.status === "COMPLETED").length
  const upcomingBookings = userBookings.filter(
    (b) => (b.status === "CONFIRMED" || b.status === "PENDING") && new Date(b.startTime) > new Date()
  ).length

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">ChargeConnect</span>
            <Badge variant="outline" className="ml-2 font-mono text-xs bg-muted">India Grid</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Welcome, {user.name}</span>
            <Button asChild variant="outline" size="sm">
              <Link href="/user/bookings">My Bookings</Link>
            </Button>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" size="icon" type="submit" title="Sign Out">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Main Content Tabs */}
        <Tabs defaultValue="discover" className="space-y-8">
          <TabsList className="bg-muted w-full justify-start rounded-md h-12 p-1 max-w-md">
            <TabsTrigger value="discover" className="rounded-sm data-[state=active]:bg-background">
              Discover Stations
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="rounded-sm data-[state=active]:bg-background">
              My Driver Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Panel: Filters & List */}
              <div className="lg:col-span-1 space-y-4 h-[750px] flex flex-col">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold tracking-tight">Discover Hubs</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search city, area or hub name..." className="pl-10 h-10" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Connector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Connectors</SelectItem>
                        <SelectItem value="CCS2">CCS2 (DC Fast)</SelectItem>
                        <SelectItem value="Type 2">Type 2 (AC)</SelectItem>
                        <SelectItem value="Bharat DC-001">Bharat DC</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        <SelectItem value="bengaluru">Bengaluru</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="gurugram">Gurugram</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Scrollable List of Stations */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stations && stations.length > 0 ? (
                    stations.map((station) => (
                      <div
                        key={station.id}
                        className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight">
                            {station.name}
                          </h3>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] shrink-0">
                            ★ {station.rating}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{station.address}, {station.city}</span>
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {station.connectorTypes.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-xs border-t pt-2 mt-2">
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">{station.chargers.length} Bays</span>
                            {" • "}{station.totalPower} kW Max
                          </div>
                          <div className="font-bold text-foreground">
                            {formatCurrency(station.minPrice)}/kWh
                          </div>
                        </div>
                        <Button className="w-full mt-3 h-8 text-xs" asChild>
                          <Link href={`/user/stations/${station.id}`}>View & Reserve Slot</Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed text-sm">
                      No stations found in the selected region.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Google Map */}
              <div className="lg:col-span-2 rounded-lg overflow-hidden border bg-muted h-[750px] relative">
                <DiscoveryMap stations={stations} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border rounded-lg bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Total Reservations</h3>
                </div>
                <div className="text-3xl font-bold">{totalBookings}</div>
                <p className="text-sm text-muted-foreground mt-1">{completedBookings} completed sessions</p>
              </div>

              <div className="p-6 border rounded-lg bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Upcoming Sessions</h3>
                </div>
                <div className="text-3xl font-bold">{upcomingBookings}</div>
                <p className="text-sm text-muted-foreground mt-1">Confirmed booking slots</p>
              </div>

              <div className="p-6 border rounded-lg bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Bookmark className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Primary Vehicle</h3>
                </div>
                <div className="text-2xl font-bold">Tata Nexon EV</div>
                <p className="text-sm text-muted-foreground mt-1">40.5 kWh • CCS2 Port</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Recent Charging History</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/user/bookings">View Complete History</Link>
                </Button>
              </div>

              <div className="border rounded-lg bg-card overflow-hidden">
                {userBookings && userBookings.length > 0 ? (
                  <div className="divide-y">
                    {userBookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-base flex items-center gap-2">
                            {booking.stationName}
                            <Badge
                              variant="outline"
                              className={
                                booking.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : booking.status === "CONFIRMED"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{booking.chargerBay} ({booking.connectorType}, {booking.powerOutput} kW)</span>
                            <span>•</span>
                            <Clock className="h-3.5 w-3.5" />
                            <span>
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
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="font-bold text-base">{formatCurrency(booking.finalCost)}</div>
                          <div className="text-xs text-muted-foreground">
                            Payment: {booking.paymentStatus === "completed" ? "Paid (UPI)" : booking.paymentStatus}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-6">
                    <History className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-1">No charging sessions yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6 text-sm">
                      You haven&apos;t booked any charging sessions. Find a nearby station on the map to reserve a bay.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
