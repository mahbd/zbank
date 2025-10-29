"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [requestingOTP, setRequestingOTP] = useState(false)
  const [error, setError] = useState("")

  const requestOTP = async () => {
    if (!email || !password) {
      setError("Please enter your email and password first")
      return
    }

    setRequestingOTP(true)
    setError("")

    try {
      // First, verify credentials before sending OTP
      const verifyResponse = await fetch('/api/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json()
        setError(data.error || 'Invalid email or password')
        setRequestingOTP(false)
        return
      }

      // If credentials are valid, send OTP
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'signin', email }),
      })

      if (response.ok) {
        const data = await response.json()
        setOtpSent(true)
        toast.success('OTP sent to your email!')
        
        // In development, show the OTP for testing
        if (process.env.NODE_ENV === 'development' && data.otp) {
          toast.info(`Development: OTP is ${data.otp}`)
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Error requesting OTP:', error)
      setError('Failed to send OTP')
    } finally {
      setRequestingOTP(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!otp) {
      setError("Please enter the OTP sent to your email")
      setIsLoading(false)
      return
    }

    try {
      // Verify OTP first
      const otpResponse = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, email, purpose: 'signin' }),
      })

      if (!otpResponse.ok) {
        setError('Invalid or expired OTP. Please request a new one.')
        setOtpSent(false)
        setOtp('')
        setIsLoading(false)
        return
      }

      // If OTP is valid, proceed with sign in
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      })
    } catch (error) {
      console.error("Error signing in:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="flex space-x-2">
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestOTP}
                  disabled={requestingOTP || otpSent}
                  className="whitespace-nowrap"
                >
                  {requestingOTP ? 'Sending...' : otpSent ? 'OTP Sent' : 'Get OTP'}
                </Button>
              </div>
              {otpSent && (
                <p className="text-sm text-muted-foreground">
                  OTP sent to your email. Check your inbox and enter the 6-digit code.
                </p>
              )}
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !otpSent}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}