import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getListerDashboardData } from "@/lib/actions/bookings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Zap, MapPin, Calendar, IndianRupee, TrendingUp, Clock, Plus, Settings, LogOut } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function ListerDashboard() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login?redirect=/lister/dashboard")
  }

  if (user.role !== "STATION_OWNER" && user.role !== "ADMIN") {
    redirect("/user/dashboard")
  }

  const data = await getListerDashboardData()
  if (!data) {
    redirect("/auth/login")
  }

  const {
    totalStations,
    activeStations,
    totalBookings,
    completedBookings,
    totalRevenue,
    stations,
    recentBookings,
  } = data

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">ChargeConnect</span>
            <Badge variant="outline" className="ml-2 font-normal text-xs bg-muted">
              Partner Hub
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Welcome, {user.name}</span>
            <Button asChild size="sm">
              <Link href="/lister/stations/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Station
              </Link>
            </Button>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" size="icon" type="submit" title="Sign Out">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl flex-1 flex flex-col">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 border rounded-lg bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Total Revenue</h3>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">From completed charges</p>
          </div>

          <div className="p-5 border rounded-lg bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Total Bookings</h3>
            </div>
            <div className="text-3xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">{completedBookings} completed</p>
          </div>

          <div className="p-5 border rounded-lg bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Active Stations</h3>
            </div>
            <div className="text-3xl font-bold">{activeStations}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalStations} total listed</p>
          </div>

          <div className="p-5 border rounded-lg bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Average / Session</h3>
            </div>
            <div className="text-3xl font-bold">
              {formatCurrency(completedBookings > 0 ? Math.round(totalRevenue / completedBookings) : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per charging cycle</p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="stations" className="flex-1 flex flex-col space-y-6">
          <TabsList className="bg-muted justify-start rounded-md h-11 p-1 w-full max-w-xs">
            <TabsTrigger value="stations" className="rounded-sm flex-1">
              My Stations ({stations.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-sm flex-1">
              Bookings ({recentBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stations" className="flex-1 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Managed Charging Infrastructure</h2>
              <Button asChild variant="outline">
                <Link href="/lister/stations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Station
                </Link>
              </Button>
            </div>

            {stations && stations.length > 0 ? (
              <div className="border rounded-lg bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">Hub Name</th>
                        <th className="px-6 py-4 font-medium">Location</th>
                        <th className="px-6 py-4 font-medium">Rating</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-b-0">
                      {stations.map((st) => (
                        <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {st.name}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {st.address}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-amber-400 font-semibold">★ {st.rating}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className={
                                st.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {st.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/lister/stations/${st.id}`}>
                                <Settings className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 px-6 border rounded-lg border-dashed bg-card">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No stations listed yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6 text-sm">
                  Add your first EV charging hub to start accepting reservations and earning revenue across India.
                </p>
                <Button asChild>
                  <Link href="/lister/stations/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Station
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="flex-1 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Recent Reservations</h2>

            {recentBookings && recentBookings.length > 0 ? (
              <div className="border rounded-lg bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Station & Bay</th>
                        <th className="px-6 py-4 font-medium">Schedule</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-b-0">
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">
                            {b.userName}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <div>{b.stationName}</div>
                            <div className="text-xs text-muted-foreground/80 font-mono">
                              {b.chargerBay} • {b.connectorType}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(b.startTime).toLocaleDateString("en-IN")}
                            </div>
                            <div className="text-xs mt-1">
                              {new Date(b.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className={
                                b.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : b.status === "CONFIRMED"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-muted"
                              }
                            >
                              {b.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-foreground">
                            {formatCurrency(b.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 px-6 border rounded-lg border-dashed bg-card">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  Customer bookings for your charging bays will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
