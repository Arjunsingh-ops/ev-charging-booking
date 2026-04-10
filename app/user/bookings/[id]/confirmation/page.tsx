import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle, Calendar, MapPin, Clock, DollarSign } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch booking details
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      charging_stations(
        name,
        address,
        city,
        state,
        connector_type,
        power_output,
        profiles!charging_stations_lister_id_fkey(full_name)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !booking) {
    redirect("/user/dashboard")
  }

  const duration = Math.round(
    (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60),
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your charging session has been successfully reserved</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Confirmation #{booking.id.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">{booking.charging_stations?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {booking.charging_stations?.address}, {booking.charging_stations?.city},{" "}
                  {booking.charging_stations?.state}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">
                  {new Date(booking.start_time).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {new Date(booking.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Duration: {duration} hours</h3>
                <p className="text-sm text-muted-foreground">
                  {booking.charging_stations?.connector_type} • {booking.charging_stations?.power_output} kW
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Total Cost: ${booking.total_price}</h3>
                <p className="text-sm text-muted-foreground">
                  Payment Status: <Badge variant="secondary">Paid</Badge>
                </p>
              </div>
            </div>

            {booking.special_instructions && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Special Instructions</h4>
                <p className="text-sm text-muted-foreground">{booking.special_instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Arrive on Time</h4>
                <p className="text-sm text-muted-foreground">
                  Please arrive at your scheduled time to maximize your charging session
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">Contact Station Owner</h4>
                <p className="text-sm text-muted-foreground">
                  Station owner: {booking.charging_stations?.profiles?.full_name}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">Start Charging</h4>
                <p className="text-sm text-muted-foreground">Connect your vehicle and begin your charging session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/user/bookings">View All Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/user/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
