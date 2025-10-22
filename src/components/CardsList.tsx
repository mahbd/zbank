import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, DollarSign } from "lucide-react"
import { formatCardNumber, formatCurrency } from "@/lib/utils"

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
  transactions: any[]
}

interface CardsListProps {
  cards: BankCard[]
  onToggleStatus: (cardId: string) => void
  onMakePayment: (cardId: string) => void
  loading: boolean
}

export function CardsList({ cards, onToggleStatus, onMakePayment, loading }: CardsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card key={card.id} className="relative" data-testid={`card-${card.id}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {card.scheme} {card.cardType}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {formatCardNumber(card.cardNumber)}
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                card.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`} data-testid={`card-status-${card.id}`}>
                {card.status}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold" data-testid={`card-balance-${card.id}`}>
                  {formatCurrency(card.balance)}
                </p>
                <p className="text-sm text-gray-500">Available Balance</p>
              </div>

              <div className="flex justify-between text-sm">
                <span>Expires: {new Date(card.expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}</span>
                <span>CVV: {card.cvv}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleStatus(card.id)}
                  data-testid={`toggle-card-status-${card.id}`}
                >
                  {card.status === 'ACTIVE' ? (
                    <>
                      <Lock className="w-4 h-4 mr-1" />
                      Freeze
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-1" />
                      Unfreeze
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={() => onMakePayment(card.id)}
                  disabled={card.status !== 'ACTIVE'}
                  data-testid={`make-payment-${card.id}`}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Make Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}