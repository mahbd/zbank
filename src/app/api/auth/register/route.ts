import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, otp } = await request.json()

    // Verify OTP first
    if (!otp) {
      return NextResponse.json(
        { error: "OTP is required" },
        { status: 400 }
      )
    }

    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        purpose: 'signup',
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    })

    // Mark OTP as used
    await prisma.oTP.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        used: true
      }
    })

    return NextResponse.json(
      { message: "User created successfully", user: { id: user.id, email: user.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}