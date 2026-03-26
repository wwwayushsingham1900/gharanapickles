import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get("admin_session")?.value
    if (!cookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Split signed value
    const parts = cookie.split(".")
    if (parts.length !== 2) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const [payloadB64, signature] = parts

    // Verify HMAC signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET || "fallback_secret")
      .update(payloadB64)
      .digest("hex")

    const sigMatch =
      signature.length === expectedSig.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))

    if (!sigMatch) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString())

    // Check expiry
    if (Date.now() > payload.expiresAt) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
