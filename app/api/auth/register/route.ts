import { NextResponse } from "next/server"
import { registerUser } from "@/app/admin/actions"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    const result = await registerUser(name, email, password)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Account created successfully!" })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An internal error occurred." }, { status: 500 })
  }
}
