import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStationById } from "@/lib/actions/stations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, MapPin, Zap, Star, Calendar, User, Clock, Navigation } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserStationDetailsPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/auth/login?redirect=/user/stations/${id}`)
  }

  const station = await getStationById(id)
  if (!station) {
    redirect("/user/dashboard")
  }

  const primaryCharger = station.chargers[0]
  const lowestRate = station.chargers.length > 0
    ? Math.min(...station.chargers.map((c) => c.pricePerKWh))
    : 18

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/user/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2 border-l pl-4 border-border">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold tracking-tight">ChargeConnect</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Main Station Info Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {station.status === "active" ? "Operational" : station.status}
              </Badge>
              <span className="flex items-center text-sm font-medium">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                {station.rating} ({station.totalRatings || station.reviews.length} reviews)
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{station.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              {station.address}, {station.city}, {station.state} - {station.pincode}
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(lowestRate)}
              <span className="text-sm text-muted-foreground font-normal"> /kWh</span>
            </div>
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link href={`/user/stations/${id}/book`}>
                <Calendar className="h-4 w-4 mr-2" />
                Reserve Charging Bay
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Station Details */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-3">About this Charging Hub</h2>
              <p className="text-muted-foreground leading-relaxed">
                {station.description || "High-reliability EV charging infrastructure compliant with Bharat EV and CCS2 standards."}
              </p>
            </section>

            {/* Available Bays & Chargers */}
            <section>
              <h2 className="text-xl font-bold mb-4">Charging Bays ({station.chargers.length})</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {station.chargers.map((charger) => (
                  <div key={charger.id} className="border rounded-lg p-4 bg-card hover:border-border/80 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-base">{charger.identifier}</div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {charger.status}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Connector:</span>
                        <span className="font-medium text-foreground">{charger.connectorType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Power Output:</span>
                        <span className="font-medium text-foreground">{charger.powerOutput} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-bold text-foreground">{formatCurrency(charger.pricePerKWh)} / kWh</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid sm:grid-cols-2 gap-6">
              <div className="border rounded-lg p-5 bg-card">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Fast Charging Specs</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Power:</span>
                    <span className="font-medium">{primaryCharger?.powerOutput || 60} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Architecture:</span>
                    <span className="font-medium">400V / 800V Compatible</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-5 bg-card">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Operational Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Schedule:</span>
                    <span className="font-medium">{station.openingHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Access:</span>
                    <span className="font-medium">Public Access</span>
                  </div>
                </div>
              </div>
            </section>

            {station.amenities && station.amenities.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">Hub Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {station.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-muted text-foreground py-1 px-2.5">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold mb-4">User Reviews & Telemetry</h2>
              {station.reviews && station.reviews.length > 0 ? (
                <div className="space-y-3">
                  {station.reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{review.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("en-IN")}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {"★".repeat(review.rating)}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-foreground mt-2">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-lg p-8 text-center bg-card">
                  <p className="text-muted-foreground text-sm">No reviews yet. Book a session and be the first to review!</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Location Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/60 rounded-md border text-xs space-y-2">
                  <div className="font-semibold text-foreground">{station.name}</div>
                  <div className="text-muted-foreground">{station.address}, {station.city}</div>
                  <div className="font-mono text-muted-foreground">
                    Coords: {station.latitude.toFixed(4)}° N, {station.longitude.toFixed(4)}° E
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={undefined}
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Open in Google Maps
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border">
              <CardHeader>
                <CardTitle className="text-lg">Typical Indian EV Charging Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tata Nexon EV (10-80%):</span>
                  <span className="font-semibold">~45 min (60kW DC)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MG ZS EV (10-80%):</span>
                  <span className="font-semibold">~42 min (60kW DC)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mahindra XUV400 (10-80%):</span>
                  <span className="font-semibold">~50 min (50kW DC)</span>
                </div>
                <p className="text-xs text-muted-foreground pt-3 border-t">
                  *Actual session duration depends on ambient battery temperature and vehicle BMS charging curve.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
