'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  CreditCard, 
  Smartphone, 
  Zap, 
  QrCode, 
  ShoppingCart,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  merchantName: z.string().optional(),
})

type PaymentForm = z.infer<typeof paymentSchema>

const paymentTypes = [
  {
    id: 'PAYMENT',
    title: 'Online Payment',
    description: 'Make online purchases',
    icon: ShoppingCart,
    color: 'bg-blue-500'
  },
  {
    id: 'MOBILE_RECHARGE',
    title: 'Mobile Recharge',
    description: 'Top up your mobile',
    icon: Smartphone,
    color: 'bg-green-500'
  },
  {
    id: 'BILL_PAYMENT',
    title: 'Bill Payment',
    description: 'Pay utility bills',
    icon: Zap,
    color: 'bg-yellow-500'
  },
  {
    id: 'QR_PAYMENT',
    title: 'QR Payment',
    description: 'Scan and pay',
    icon: QrCode,
    color: 'bg-purple-500'
  }
]

export default function PaymentsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema)
  })

  const onSubmit = async (data: PaymentForm) => {
    setLoading(true)
    
    // Simulate payment processing
    setTimeout(() => {
      console.log('Payment processed:', { ...data, type: selectedType })
      alert(`Payment of $${data.amount} processed successfully!`)
      reset()
      setSelectedType(null)
      setLoading(false)
    }, 2000)
  }

  if (selectedType) {
    const paymentType = paymentTypes.find(type => type.id === selectedType)
    const Icon = paymentType?.icon || CreditCard

    return (
      <div className="min-h-screen bg-gray-50 p-6" data-testid="payment-form">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedType(null)}
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payment Types
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${paymentType?.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle data-testid="payment-type-title">
                    {paymentType?.title}
                  </CardTitle>
                  <p className="text-gray-600">{paymentType?.description}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    data-testid="amount-input"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1" data-testid="amount-error">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    {...register('description')}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Payment description"
                    data-testid="description-input"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1" data-testid="description-error">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {selectedType === 'PAYMENT' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Merchant Name (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('merchantName')}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Merchant name"
                      data-testid="merchant-input"
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  data-testid="submit-payment-button"
                >
                  {loading ? 'Processing...' : `Pay Now`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" data-testid="payments-page">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" data-testid="home-link">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="payments-title">
            Payments & Services
          </h1>
          <p className="text-gray-600">Choose a payment type to get started</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentTypes.map((type) => {
            const Icon = type.icon
            return (
              <Card 
                key={type.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedType(type.id)}
                data-testid={`payment-type-${type.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-full ${type.color} text-white`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{type.title}</h3>
                      <p className="text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* VAS Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6" data-testid="vas-section-title">
            Value-Added Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4" data-testid="vas-mobile-recharge">
              <div className="text-center">
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-medium">Mobile Recharge</h3>
                <p className="text-sm text-gray-600">Top up any mobile number</p>
              </div>
            </Card>
            
            <Card className="p-4" data-testid="vas-bill-payment">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-medium">Utility Bills</h3>
                <p className="text-sm text-gray-600">Pay electricity, water, gas</p>
              </div>
            </Card>
            
            <Card className="p-4" data-testid="vas-qr-payment">
              <div className="text-center">
                <QrCode className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-medium">QR Payments</h3>
                <p className="text-sm text-gray-600">Scan QR codes to pay</p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
