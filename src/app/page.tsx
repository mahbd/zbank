'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Plus, Activity, DollarSign, Lock, Unlock } from 'lucide-react'
import { formatCurrency, formatCardNumber } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCardSchema, transactionSchema, type CreateCardInput, type TransactionInput, paymentSchema, type PaymentInput } from '@/lib/validations'
import { CardCreationDialog } from "@/components/CardCreationDialog"
import { PaymentDialog } from "@/components/PaymentDialog"
import { CardsList } from "@/components/CardsList"
import { TransactionsList } from "@/components/TransactionsList"
import { toast } from "sonner"

interface BankCard {
  id: string
  cardNumber: string
  cardType: 'PHYSICAL' | 'VIRTUAL'
  status: 'ACTIVE' | 'FROZEN' | 'BLOCKED'
  balance: number
  scheme: string
  expiryDate: string
  cvv: string
  cardholderName?: string
  creditLimit?: number
  dailyLimit: number
  transactions: Transaction[]
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  merchantName?: string
  status: string
  createdAt: string
}

export default function Dashboard() {
  const [cards, setCards] = useState<BankCard[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [createVirtualCardOpen, setCreateVirtualCardOpen] = useState(false)
  const [createPhysicalCardOpen, setCreatePhysicalCardOpen] = useState(false)
  const [makePaymentOpen, setMakePaymentOpen] = useState(false)

  const createCardForm = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      cardType: 'VIRTUAL',
      scheme: 'Visa',
      cardholderName: '',
      dailyLimit: 1000,
      deliveryAddress: '',
      deliveryCity: '',
      deliveryState: '',
      deliveryZipCode: '',
      deliveryCountry: '',
    },
  })

  const paymentForm = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      type: 'PAYMENT',
      description: '',
      cardId: '',
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cardsRes, transactionsRes] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/transactions'),
      ])
      
      let cardsData = []
      if (cardsRes.ok) {
        cardsData = await cardsRes.json()
        // Ensure cardsData is an array
        if (!Array.isArray(cardsData)) {
          cardsData = []
        }
      } else {
        console.error('Failed to fetch cards:', cardsRes.statusText)
      }
      
      let transactionsData = []
      if (transactionsRes.ok) {
        transactionsData = await transactionsRes.json()
        // Ensure transactionsData is an array
        if (!Array.isArray(transactionsData)) {
          transactionsData = []
        }
      } else {
        console.error('Failed to fetch transactions:', transactionsRes.statusText)
      }
      
      setCards(cardsData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Error loading data:', error)
      setCards([])
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const createCard = async (data: CreateCardInput) => {
    setLoading(true)
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        const newCard = await response.json()
        setCards([...cards, { ...newCard, transactions: [] }])
        setCreateVirtualCardOpen(false)
        setCreatePhysicalCardOpen(false)
        createCardForm.reset()
        toast.success('Card created successfully!')
      } else {
        toast.error('Failed to create card')
      }
    } catch (error) {
      console.error('Error creating card:', error)
      toast.error('Error creating card')
    } finally {
      setLoading(false)
    }
  }

  const toggleCardStatus = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return

    const newStatus = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE'
    try {
      const response = await fetch(`/api/cards/${cardId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setCards(cards.map(c => c.id === cardId ? { ...c, status: newStatus } : c))
        toast.success(`Card ${newStatus.toLowerCase()} successfully!`)
      } else {
        toast.error('Failed to update card status')
      }
    } catch (error) {
      console.error('Error updating card status:', error)
      toast.error('Error updating card status')
    }
  }

  const makePayment = async (data: PaymentInput) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        const newTransaction = await response.json()
        setTransactions([newTransaction, ...transactions])
        // Update card balance
        setCards(cards.map(card => 
          card.id === data.cardId 
            ? { ...card, balance: card.balance - data.amount }
            : card
        ))
        setMakePaymentOpen(false)
        paymentForm.reset()
        toast.success('Payment made successfully!')
      } else {
        toast.error('Failed to make payment')
      }
    } catch (error) {
      console.error('Error making payment:', error)
      toast.error('Error making payment')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6" data-testid="dashboard">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-title">
              ZBank Dashboard
            </h1>
            <p className="text-gray-600">Manage your cards and transactions</p>
          </header>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              <section className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold" data-testid="cards-section-title">
                    Your Cards
                  </h2>
                  <div className="space-x-2">
                    <Button 
                      onClick={() => setCreateVirtualCardOpen(true)}
                      disabled={loading}
                      data-testid="create-virtual-card-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Virtual Card
                    </Button>
                    <Button 
                      onClick={() => setCreatePhysicalCardOpen(true)}
                      disabled={loading}
                      data-testid="create-physical-card-btn"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Physical Card
                    </Button>
                  </div>
                </div>
                <CardsList 
                  cards={cards} 
                  onToggleStatus={toggleCardStatus} 
                  onMakePayment={(cardId) => { 
                    paymentForm.setValue('cardId', cardId); 
                    setMakePaymentOpen(true) 
                  }} 
                  loading={loading} 
                />
              </section>
              <TransactionsList transactions={transactions} />
            </>
          )}
        </div>
      </div>

      <CardCreationDialog 
        open={createVirtualCardOpen} 
        onOpenChange={setCreateVirtualCardOpen} 
        form={createCardForm} 
        onSubmit={createCard} 
        type="VIRTUAL" 
        loading={loading} 
      />
      <CardCreationDialog 
        open={createPhysicalCardOpen} 
        onOpenChange={setCreatePhysicalCardOpen} 
        form={createCardForm} 
        onSubmit={createCard} 
        type="PHYSICAL" 
        loading={loading} 
      />
      <PaymentDialog 
        open={makePaymentOpen} 
        onOpenChange={setMakePaymentOpen} 
        form={paymentForm} 
        onSubmit={makePayment} 
        loading={loading} 
      />
    </>
  )
}
