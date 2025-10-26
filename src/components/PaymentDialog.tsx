import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { PaymentInput } from "@/lib/validations"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UseFormReturn<PaymentInput>
  onSubmit: (data: PaymentInput) => void
  loading: boolean
  selectedService?: {
    name: string
    description: string
    minAmount: number
    maxAmount: number
  }
  availableCards?: Array<{
    id: string
    cardNumber: string
    scheme: string
    cardType: string
    balance: number
    status: string
  }>
}

export function PaymentDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  loading,
  selectedService,
  availableCards = []
}: PaymentDialogProps) {
  const transactionTypes = [
    { value: 'PAYMENT', label: 'General Payment' },
    { value: 'BILL_PAYMENT', label: 'Bill Payment' },
    { value: 'MOBILE_RECHARGE', label: 'Mobile Recharge' },
    { value: 'QR_PAYMENT', label: 'QR Payment' },
    { value: 'INTERNET_BILL', label: 'Internet Bill' },
    { value: 'ELECTRICITY_BILL', label: 'Electricity Bill' },
    { value: 'GAS_BILL', label: 'Gas Bill' },
    { value: 'WATER_BILL', label: 'Water Bill' },
    { value: 'CABLE_TV', label: 'Cable TV' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'EDUCATION_FEES', label: 'Education Fees' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'TRANSPORT', label: 'Transport' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedService ? `Pay ${selectedService.name}` : 'Make Payment'}
          </DialogTitle>
          {selectedService && (
            <p className="text-sm text-gray-600">{selectedService.description}</p>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!selectedService && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>Select payment type</option>
                        {transactionTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
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
                  <FormLabel>Select Card</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Choose a card for payment</option>
                      {availableCards
                        .filter(card => card.status === 'ACTIVE')
                        .map(card => (
                          <option key={card.id} value={card.id}>
                            {card.scheme} ****{card.cardNumber.slice(-4)} - ${card.balance.toFixed(2)} available
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
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={selectedService ? `${selectedService.minAmount} - ${selectedService.maxAmount}` : "0.00"}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  {selectedService && (
                    <p className="text-xs text-gray-500">
                      Range: ${selectedService.minAmount} - ${selectedService.maxAmount}
                    </p>
                  )}
                  <FormMessage />
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
                      placeholder={selectedService ? selectedService.name : "Payment description"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="merchantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Provider / Merchant</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={selectedService ? selectedService.name : "Merchant name"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Make Payment'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}