import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import { hashPassword, signJWT, AUTH_COOKIE_NAME } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, role, userType } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    // Map userType or role: 'lister' -> 'STATION_OWNER', default 'USER'
    let finalRole: "USER" | "STATION_OWNER" | "ADMIN" = "USER"
    if (role === "STATION_OWNER" || userType === "lister") {
      finalRole = "STATION_OWNER"
    } else if (role === "ADMIN") {
      finalRole = "ADMIN"
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : undefined,
      passwordHash,
      role: finalRole,
    })

    const token = await signJWT({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Signup route error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred during account creation" },
      { status: 500 }
    )
  }
}
