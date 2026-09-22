import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getBookingById } from "@/lib/actions/bookings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle, Calendar, MapPin, Clock, IndianRupee, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const booking = await getBookingById(id)
  if (!booking) {
    redirect("/user/dashboard")
  }

  const durationHrs = Math.max(
    0.5,
    Math.round(
      ((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)) * 10
    ) / 10
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Reservation Confirmed!</h1>
          <p className="text-muted-foreground">
            Your EV charging bay is locked and reserved on the platform.
          </p>
        </div>

        <Card className="mb-6 border-border">
          <CardHeader>
            <CardTitle>Session Confirmation Slip</CardTitle>
            <CardDescription>Reservation #{booking.id.slice(-8).toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-base">{booking.stationName}</h3>
                <p className="text-sm text-muted-foreground">{booking.stationAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div>
                <h3 className="font-medium">
                  {new Date(booking.startTime).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} —{" "}
                  {new Date(booking.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary shrink-0" />
              <div>
                <h3 className="font-medium">
                  {booking.chargerBay} ({booking.connectorType} • {booking.powerOutput} kW)
                </h3>
                <p className="text-sm text-muted-foreground">Scheduled Duration: {durationHrs} hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IndianRupee className="h-5 w-5 text-primary shrink-0" />
              <div>
                <h3 className="font-medium">Estimated Amount: {formatCurrency(Number(booking.totalPrice))}</h3>
                <p className="text-sm text-muted-foreground">
                  Payment Status: <Badge variant="outline" className="ml-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Paid</Badge>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-border">
          <CardHeader>
            <CardTitle className="text-base">Arrival Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-sm">Arrive 5 minutes prior</h4>
                <p className="text-xs text-muted-foreground">
                  Park in {booking.chargerBay} to avoid queuing conflicts.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-sm">Plug in your EV</h4>
                <p className="text-xs text-muted-foreground">
                  Connect {booking.connectorType} gun to your charging inlet until the click locks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-sm">Automated Dispensing</h4>
                <p className="text-xs text-muted-foreground">
                  The charger will automatically begin delivery corresponding to this booking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/user/bookings">View All Reservations</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/user/dashboard">Back to Hub Discovery</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
