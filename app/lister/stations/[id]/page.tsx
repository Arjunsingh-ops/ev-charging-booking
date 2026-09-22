import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStationById } from "@/lib/actions/stations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, MapPin, Zap, Edit, Calendar, IndianRupee, Star, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StationDetailsPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const station = await getStationById(id)
  if (!station) {
    redirect("/lister/dashboard")
  }

  const primaryCharger = station.chargers[0]
  const avgRate = station.chargers.length > 0
    ? station.chargers[0].pricePerKWh
    : 18

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/lister/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">{station.name}</span>
            </div>
          </div>
          <Button asChild size="sm">
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
            <Card className="border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{station.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1 text-sm">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      {station.address}, {station.city}, {station.state} - {station.pincode}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      station.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {station.status === "active" ? "Operational" : station.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {station.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{station.description}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="border rounded-lg p-4 bg-muted/40 space-y-2 text-sm">
                    <div className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Charging Hardware
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary Connector:</span>
                      <span className="font-medium">{primaryCharger?.connectorType || "CCS2"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Power Rating:</span>
                      <span className="font-medium">{primaryCharger?.powerOutput || 60} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tariff Rate:</span>
                      <span className="font-bold text-foreground">{formatCurrency(avgRate)} / kWh</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/40 space-y-2 text-sm">
                    <div className="font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Station Operations
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operating Schedule:</span>
                      <span className="font-medium">{station.openingHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Bays:</span>
                      <span className="font-medium">{station.chargers.length} bays deployed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer Rating:</span>
                      <span className="font-medium text-amber-400">★ {station.rating}</span>
                    </div>
                  </div>
                </div>

                {station.amenities && station.amenities.length > 0 && (
                  <div className="pt-2">
                    <h4 className="font-semibold text-sm mb-2">Configured Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {station.amenities.map((amenity: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-muted text-foreground">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Individual Bays */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Configured Charging Bays ({station.chargers.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {station.chargers.map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-3.5 border rounded-lg bg-card">
                    <div>
                      <div className="font-semibold text-sm">{c.identifier}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.connectorType} • {c.powerOutput} kW • {c.chargingSpeed}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{formatCurrency(c.pricePerKWh)}/kWh</div>
                      <Badge variant="outline" className="text-[10px] mt-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {c.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Site Telemetry & Rating</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">Driver Rating</span>
                  </div>
                  <span className="font-bold">{station.rating} / 5</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">Feedback Reviews</span>
                  </div>
                  <span className="font-bold">{station.reviews.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm">Active Pricing</span>
                  </div>
                  <span className="font-bold">{formatCurrency(avgRate)}/kWh</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/lister/stations/${id}/edit`}>Edit Details & Rates</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/user/stations/${id}`}>Preview Public Driver View</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
