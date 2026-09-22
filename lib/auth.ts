import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import connectToDatabase from "@/lib/mongodb"
import User, { IUser } from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET || "chargeconnect-super-secure-jwt-secret-key-production-2026"
const encodedKey = new TextEncoder().encode(JWT_SECRET)
export const AUTH_COOKIE_NAME = "chargeconnect_session"

export interface JWTPayload {
  userId: string
  email: string
  role: "USER" | "STATION_OWNER" | "ADMIN"
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    })
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "USER" | "STATION_OWNER" | "ADMIN",
      name: payload.name as string,
    }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload?.userId) return null

    await connectToDatabase()
    const user = await User.findById(payload.userId).select("-passwordHash").lean()
    return user as unknown as IUser
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return null
  }
}

export async function getCurrentSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null
    return await verifyJWT(token)
  } catch {
    return null
  }
}
