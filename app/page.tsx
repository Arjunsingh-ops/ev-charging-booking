"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Zap, MapPin, Search, Navigation } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">ChargeConnect</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#discovery" className="text-muted-foreground hover:text-foreground transition-colors">
              Find Chargers
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground transition-colors">
              For Businesses
            </Link>
            <div className="w-px h-4 bg-border mx-2"></div>
            <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild variant="default" className="rounded-md">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto w-full">
        <Badge variant="outline" className="mb-8 py-1.5 px-4 text-primary border-primary/20 bg-primary/10">
          EV Charging Infrastructure for India
        </Badge>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Find a charger. <br /> Plan your journey.
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl font-light">
          The reliable network connecting EV drivers with charging stations across the country. Book instantly and charge with confidence.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button size="lg" className="h-14 px-8 text-lg rounded-lg shadow-sm" asChild>
            <Link href="/user/dashboard">
              <Search className="mr-2 h-5 w-5" />
              Find Stations
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-lg" asChild>
            <Link href="/auth/signup">
              List Your Station
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Overview */}
      <section className="bg-muted py-24 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center mb-6 shadow-sm border">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Availability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Check exactly which chargers are free before you arrive. No more waiting in line.
              </p>
            </div>
            <div>
              <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center mb-6 shadow-sm border">
                <Navigation className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reserve your slot in seconds with transparent pricing and secure payments.
              </p>
            </div>
            <div>
              <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center mb-6 shadow-sm border">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Universal Access</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compatible with all major EV models in India. Filter by your connector type effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold text-muted-foreground">ChargeConnect</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
