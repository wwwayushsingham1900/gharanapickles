import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      return NextResponse.json({ error: "Admin credentials not configured" }, { status: 500 })
    }

    // Constant-time comparison to prevent timing attacks
    const usernameMatch =
      username.length === adminUsername.length &&
      crypto.timingSafeEqual(Buffer.from(username), Buffer.from(adminUsername))

    const passwordMatch =
      password.length === adminPassword.length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword))

    if (!usernameMatch || !passwordMatch) {
      // Add a small delay to slow brute force attempts
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate a secure session token
    const sessionToken = crypto.randomBytes(48).toString("hex")
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // Create signed token payload
    const payload = JSON.stringify({ token: sessionToken, expiresAt })
    const payloadB64 = Buffer.from(payload).toString("base64")
    const signature = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET || "fallback_secret")
      .update(payloadB64)
      .digest("hex")
    const signedValue = `${payloadB64}.${signature}`

    const response = NextResponse.json({ success: true })

    response.cookies.set("admin_session", signedValue, {
      httpOnly: true,       // Not accessible via JS (prevents XSS)
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",   // Prevents CSRF
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
