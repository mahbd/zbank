"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { transferSchema, type TransferInput } from "@/lib/validations"
import { toast } from "sonner"
import { Check, Search } from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
}

interface RecipientCard {
  id: string
  cardNumber: string
  cardType: string
  scheme: string
  balance: number
  cardholderName: string | null
}

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableCards: Array<{
    id: string
    cardNumber: string
    cardType: string
    balance: number
  }>
  loading?: boolean
}

export function TransferDialog({ open, onOpenChange, availableCards, loading }: TransferDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userSearchOpen, setUserSearchOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [userSearchResults, setUserSearchResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [recipientCards, setRecipientCards] = useState<RecipientCard[]>([])
  const [loadingRecipientCards, setLoadingRecipientCards] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [requestingOTP, setRequestingOTP] = useState(false)

  const form = useForm<TransferInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientEmail: "",
      amount: 0,
      cardId: "",
      description: "",
      otp: "",
    },
  })

  const selectedCardId = form.watch("cardId")
  const selectedCard = availableCards.find(card => String(card.id) === selectedCardId)
  const transferAmount = form.watch("amount")

  // Search for users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (userSearchQuery.length < 2) {
        setUserSearchResults([])
        return
      }

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(userSearchQuery)}`)
        if (response.ok) {
          const users = await response.json()
          setUserSearchResults(users)
        }
      } catch (error) {
        console.error('User search error:', error)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [userSearchQuery])

  // Update form when user is selected
  useEffect(() => {
    if (selectedUser) {
      form.setValue("recipientEmail", selectedUser.email)
      // Fetch recipient's cards
      fetchRecipientCards(selectedUser.email)
    } else {
      setRecipientCards([])
      form.setValue("recipientCardId", undefined)
    }
  }, [selectedUser, form])

  const fetchRecipientCards = async (email: string) => {
    setLoadingRecipientCards(true)
    try {
      const response = await fetch(`/api/transfers/recipient-cards?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        setRecipientCards(data.cards || [])
      } else {
        setRecipientCards([])
      }
    } catch (error) {
      console.error('Error fetching recipient cards:', error)
      setRecipientCards([])
    } finally {
      setLoadingRecipientCards(false)
    }
  }

  const requestOTP = async () => {
    setRequestingOTP(true)
    try {
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'transfer' }),
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
        toast.error('Failed to send OTP')
      }
    } catch (error) {
      console.error('Error requesting OTP:', error)
      toast.error('Failed to send OTP')
    } finally {
      setRequestingOTP(false)
    }
  }

  const onSubmit = async (data: TransferInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        const transferType = result.transfer.transferType === 'card-to-card' 
          ? 'card-to-card transfer' 
          : 'account balance transfer'
        
        toast.success(`${result.message} (${transferType})`)
        form.reset()
        setSelectedUser(null)
        setUserSearchQuery("")
        setRecipientCards([])
        setOtpSent(false)
        onOpenChange(false)
      } else {
        const error = await response.json()
        
        // Handle OTP-specific errors
        if (error.error === 'Invalid or expired OTP') {
          form.setError('otp', {
            type: 'server',
            message: 'Invalid or expired OTP. Please request a new one.'
          })
        } else {
          toast.error(error.error || 'Failed to process transfer')
        }
      }
    } catch (error) {
      console.error('Transfer error:', error)
      toast.error('Failed to process transfer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <div className="relative">
                    <div className="flex">
                      <Input
                        placeholder="Search for recipient..."
                        value={userSearchQuery}
                        onChange={(e) => {
                          setUserSearchQuery(e.target.value)
                          setUserSearchOpen(true)
                        }}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setUserSearchOpen(!userSearchOpen)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {userSearchOpen && userSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {userSearchResults.map((user) => (
                          <div
                            key={user.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                            onClick={() => {
                              setSelectedUser(user)
                              setUserSearchOpen(false)
                              setUserSearchQuery("")
                            }}
                          >
                            <div>
                              <div className="font-medium">{user.name || user.email}</div>
                              {user.name && <div className="text-sm text-gray-500">{user.email}</div>}
                            </div>
                            {selectedUser?.id === user.id && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedUser && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-blue-900">{selectedUser.name || selectedUser.email}</div>
                            {selectedUser.name && <div className="text-sm text-blue-700">{selectedUser.email}</div>}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(null)
                              form.setValue("recipientEmail", "")
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                        <div className="mt-2 text-xs text-blue-600">
                          {recipientCards.length === 0
                            ? "Recipient has no active cards. Funds will be transferred to their account balance."
                            : recipientCards.length === 1
                            ? "Recipient has 1 active card. Funds will be transferred to their card."
                            : "Recipient has multiple cards. Choose which card to transfer funds to:"
                          }
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {recipientCards.length > 1 && (
              <FormField
                control={form.control}
                name="recipientCardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient&apos;s Card</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>Select recipient&apos;s card</option>
                        {recipientCards.map((card) => (
                          <option key={card.id} value={card.id}>
                            **** **** **** {card.cardNumber.slice(-4)} - {card.scheme} {card.cardType} - ${card.balance.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="cardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Card</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select a card</option>
                      {availableCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          **** **** **** {card.cardNumber.slice(-4)} - ${card.balance.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  {selectedCard && transferAmount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Remaining balance: ${(selectedCard.balance - transferAmount).toFixed(2)}
                      {transferAmount > selectedCard.balance && (
                        <span className="text-red-600 ml-2">Insufficient funds</span>
                      )}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What's this transfer for?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        {...field}
                        className="flex-1"
                      />
                    </FormControl>
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
                    <p className="text-sm text-muted-foreground mt-1">
                      OTP sent to your email. Check your inbox and enter the 6-digit code.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={(() => {
                  const disabled = isSubmitting || !selectedCard || transferAmount > selectedCard.balance || !selectedUser || (recipientCards.length > 1 && !form.watch("recipientCardId")) || !form.watch("otp");
                  if (disabled) {
                    console.log('Transfer button disabled because:', {
                      isSubmitting,
                      selectedCard: !!selectedCard,
                      transferAmount,
                      selectedCardBalance: selectedCard?.balance,
                      amountExceedsBalance: transferAmount > (selectedCard?.balance || 0),
                      selectedUser: !!selectedUser,
                      recipientCardsLength: recipientCards.length,
                      recipientCardId: form.watch("recipientCardId"),
                      needsRecipientCard: recipientCards.length > 1 && !form.watch("recipientCardId"),
                      otp: form.watch("otp"),
                      hasOtp: !!form.watch("otp")
                    });
                  }
                  return disabled;
                })()}
              >
                {isSubmitting ? "Processing..." : "Transfer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}