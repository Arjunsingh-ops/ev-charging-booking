"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Zap } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [userType, setUserType] = useState<"user" | "lister">("user")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: userType === "lister" ? "STATION_OWNER" : "USER",
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "An error occurred during account creation")
      }

      if (data.user?.role === "STATION_OWNER") {
        router.push("/lister/dashboard")
      } else {
        router.push("/user/dashboard")
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">ChargeConnect</span>
          </div>

          <Card className="border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Join the EV charging network across India</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Rajesh Sharma"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="rajesh@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password (minimum 6 characters)</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3 pt-1">
                    <Label>Account Purpose</Label>
                    <RadioGroup
                      value={userType}
                      onValueChange={(val: "user" | "lister") => setUserType(val)}
                      className="grid grid-cols-1 gap-2"
                    >
                      <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/40">
                        <RadioGroupItem value="user" id="user" />
                        <Label htmlFor="user" className="font-medium cursor-pointer">
                          EV Driver — Book & charge vehicles
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/40">
                        <RadioGroupItem value="lister" id="lister" />
                        <Label htmlFor="lister" className="font-medium cursor-pointer">
                          Station Partner — List & monetize EV chargers
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {error && <p className="text-sm text-destructive font-medium">{error}</p>}

                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Complete Registration"}
                  </Button>
                </div>

                <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4 text-primary">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
