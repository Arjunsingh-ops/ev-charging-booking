"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Zap, MapPin, Clock, Shield, Users, TrendingUp, ChevronRight } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
}

const STAGGER_CHILDREN_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

export default function HomePage() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  // We map the initial 50% of the scroll container to an opacity fade and a small scale down
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-emerald-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-lg group-hover:shadow-[0_0_20px_rgba(52,211,150,0.5)] transition-all duration-300">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
              ChargeConnect
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#how-it-works" className="text-white/70 hover:text-white transition-colors">
              How it Works
            </Link>
            <Link href="#features" className="text-white/70 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/auth/login" className="text-white/70 hover:text-white transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-white text-black hover:bg-white/90 rounded-full px-6 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)] border-0">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        ref={targetRef}
        style={{ opacity, scale }}
        className="relative pt-32 pb-24 px-4 z-10 min-h-[85vh] flex items-center"
      >
        <motion.div 
          className="container mx-auto text-center max-w-5xl"
          variants={STAGGER_CHILDREN_VARIANTS}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex justify-center">
            <Badge variant="outline" className="mb-6 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              The Future of EV Charging
            </Badge>
          </motion.div>
          <motion.h1 variants={FADE_UP_ANIMATION_VARIANTS} className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 text-balance tracking-tight leading-tight">
            Connect EV Drivers with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"> 
              Charging Stations
            </span>
          </motion.h1>
          <motion.p variants={FADE_UP_ANIMATION_VARIANTS} className="text-xl md:text-2xl text-white/60 mb-12 text-pretty max-w-3xl mx-auto font-light">
            The hyper-efficient marketplace bringing together EV drivers and station owners. Maximize revenue, minimize range anxiety.
          </motion.p>
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-[0_0_30px_rgba(52,211,150,0.3)] hover:shadow-[0_0_40px_rgba(52,211,150,0.5)] transition-all hover:-translate-y-1 border-0" asChild>
              <Link href="/auth/signup">
                <Users className="mr-2 h-5 w-5" />
                Find Charging Stations
                <ChevronRight className="ml-2 h-5 w-5 opacity-70" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all hover:-translate-y-1" asChild>
              <Link href="/auth/signup">
                <TrendingUp className="mr-2 h-5 w-5" />
                List Your Station
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-4 relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">How ChargeConnect Works</h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto font-light">
              Simple, secure, and efficient charging solutions designed for the modern electric ecosystem.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* For Drivers */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-xl group hover:border-emerald-500/30 transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 space-y-8">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl mb-6 shadow-[0_0_20px_rgba(52,211,150,0.2)]">
                    <Users className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-white">For EV Drivers</h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-emerald-400 to-transparent rounded-full" />
                </div>
                <div className="space-y-6">
                  {[
                    { title: "Search & Discover", desc: "Find charging stations near you with real-time availability" },
                    { title: "Book Instantly", desc: "Reserve your charging slot with transparent pricing" },
                    { title: "Charge & Go", desc: "Arrive, charge, and continue your journey hassle-free" },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6 group/step">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 text-emerald-400 rounded-xl flex items-center justify-center text-lg font-bold group-hover/step:bg-emerald-500/20 group-hover/step:border-emerald-500/50 transition-all shadow-lg">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-2 text-white/90 group-hover/step:text-emerald-400 transition-colors">{step.title}</h4>
                        <p className="text-white/50 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* For Station Owners */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative p-8 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-xl group hover:border-cyan-500/30 transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 space-y-8">
                <div>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/20 rounded-2xl mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <TrendingUp className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-white">For Station Owners</h3>
                  <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
                </div>
                <div className="space-y-6">
                  {[
                    { title: "List Your Station", desc: "Add your charging station with photos and details" },
                    { title: "Manage Bookings", desc: "Set availability, pricing, and manage reservations" },
                    { title: "Earn Revenue", desc: "Get paid automatically for each charging session" },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6 group/step">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 text-cyan-400 rounded-xl flex items-center justify-center text-lg font-bold group-hover/step:bg-cyan-500/20 group-hover/step:border-cyan-500/50 transition-all shadow-lg">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold mb-2 text-white/90 group-hover/step:text-cyan-400 transition-colors">{step.title}</h4>
                        <p className="text-white/50 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-4 relative z-10 border-t border-white/5">
        {/* subtle grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="container mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Why Choose ChargeConnect</h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto font-light">
              Engineered for the ultimate EV experience with features that matter.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              { icon: MapPin, title: "Real-time Availability", desc: "See live availability and never arrive to a busy station again. Data updates in milliseconds." },
              { icon: Clock, title: "Flexible Scheduling", desc: "Book charging sessions that fit your daily flow, from quick 15-minute top-ups to overnight stays." },
              { icon: Shield, title: "Secure Payments", desc: "Military-grade encrypted transactions with transparent pricing and instant digital receipts." },
              { icon: Users, title: "Community Driven", desc: "Read honest reviews from thousands of other EV drivers to find the best charging experience hidden gems." },
              { icon: Zap, title: "Universal Connectors", desc: "Native support for all major EV connector types including Tesla NACS, CCS, and CHAdeMO." },
              { icon: TrendingUp, title: "AI Optimization", desc: "Smart algorithmic pricing suggestions and deep analytics to automatically maximize your station revenue." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-8 rounded-3xl bg-black/40 border border-white/10 hover:border-emerald-500/50 backdrop-blur-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
                <feature.icon className="h-12 w-12 text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300 origin-bottom-left drop-shadow-[0_0_15px_rgba(52,211,150,0.4)]" />
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-emerald-300 transition-colors">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative z-10 overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto text-center max-w-4xl relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Ready to Join the Revolution?
          </h2>
          <p className="text-2xl mb-12 text-white/60 font-light max-w-2xl mx-auto">
            Experience the future of charging. Zero friction, total control.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all border-0" asChild>
              <Link href="/auth/signup">Start as EV Driver</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-10 text-lg rounded-full border-white/20 bg-black/50 text-white hover:bg-white/10 backdrop-blur-md hover:scale-105 active:scale-95 transition-all outline-none"
              asChild
            >
              <Link href="/auth/signup">List Your Station</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 relative z-10 bg-black">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-md">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white/90">ChargeConnect</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40 font-medium">
              <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-emerald-400 transition-colors">Contact Support</Link>
              <Link href="#" className="hover:text-emerald-400 transition-colors">Careers</Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-white/30">
            © {new Date().getFullYear()} ChargeConnect Inc. All rights reserved. Built for the modern grid.
          </div>
        </div>
      </footer>
    </div>
  )
}
