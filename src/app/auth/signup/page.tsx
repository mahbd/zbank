"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import bcrypt from "bcryptjs"
import { toast } from "sonner"

export default function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [requestingOTP, setRequestingOTP] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const router = useRouter()

  const requestOTP = async () => {
    // Validate form fields before sending OTP
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setRequestingOTP(true)
    setError("")

    try {
      // First, check if email already exists
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()
      
      if (checkData.exists) {
        setError('An account with this email already exists')
        setRequestingOTP(false)
        return
      }

      // If email is available, send OTP
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'signup', email }),
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

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (!otp) {
      setError("Please enter the OTP sent to your email")
      setIsLoading(false)
      return
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 12)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password: hashedPassword,
          otp,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Extract part of the user ID for transaction ID
        const txId = data.user?.id ? `TXN-${data.user.id.substring(0, 8).toUpperCase()}` : `TXN-${Date.now()}`
        setTransactionId(txId)
        setShowSuccessDialog(true)
      } else {
        const data = await response.json()
        if (data.error === 'Invalid or expired OTP') {
          setError('Invalid or expired OTP. Please request a new one.')
          setOtpSent(false)
          setOtp('')
        } else {
          setError(data.error || "An error occurred")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Signup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create your account to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">Account Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Your account has been created successfully.</p>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm font-semibold text-gray-700">Transaction ID:</p>
                <p className="text-lg font-mono font-bold text-gray-900">{transactionId}</p>
              </div>
              <p className="text-sm">Please save this transaction ID for your records.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push("/auth/signin")}>
              Go to Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}