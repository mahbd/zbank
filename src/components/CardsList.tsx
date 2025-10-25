import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Unlock, DollarSign, Trash2 } from "lucide-react"
import { formatCardNumber, formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface BankCard {
  id: string;
  cardNumber: string;
  cardType: "PHYSICAL" | "VIRTUAL";
  status: "ACTIVE" | "FROZEN" | "BLOCKED";
  balance: number;
  scheme: string;
  expiryDate: string;
  cvv: string;
  cardholderName?: string;
  creditLimit?: number;
  dailyLimit: number;
  transactions: any[];
}

interface CardsListProps {
  cards: BankCard[]
  onToggleStatus: (cardId: string) => void
  onMakePayment: (cardId: string) => void
  loading: boolean
}

export function CardsList({
  cards,
  onToggleStatus,
  onMakePayment,
  loading,
}: CardsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<BankCard | null>(null)

  const handleDeleteClick = (card: BankCard) => {
    setCardToDelete(card)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!cardToDelete) return

    try {
      const response = await fetch(`/api/cards/${cardToDelete.id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        // Remove the card from the local state by triggering a page reload
        // or we could pass a callback to update the parent state
        window.location.reload()
        toast.success('Card deleted successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete card')
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      toast.error('Error deleting card')
    } finally {
      setDeleteDialogOpen(false)
      setCardToDelete(null)
    }
  }
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      id="cards-list"
    >
      {cards.map((card) => (
        <Card
          key={card.id}
          className="relative"
          data-testid={`card-${card.id}`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {card.scheme} {card.cardType}
                </CardTitle>
                <p className="text-sm text-gray-500" data-testid={`card-number-${card.id}`}>
                  {formatCardNumber(card.cardNumber)}
                </p>
              </div>
              <div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    card.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                  data-testid={`card-status-${card.id}`}
                >
                  {card.status}
                </div>
                <div className="text-sm text-gray-600 mt-2" data-testid={`card-holder-name-${card.id}`}>
                  {card.cardholderName}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p
                  className="text-2xl font-bold"
                  data-testid={`card-balance-${card.id}`}
                >
                  {formatCurrency(card.balance)}
                </p>
                <p className="text-sm text-gray-500">Available Balance</p>
              </div>

              <div className="flex justify-between text-sm">
                <span>
                  Expires:{" "}
                  {new Date(card.expiryDate).toLocaleDateString("en-US", {
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </span>
                <span>CVV: {card.cvv}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleStatus(card.id)}
                  data-testid={`toggle-card-status-${card.id}`}
                >
                  {card.status === "ACTIVE" ? (
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
                  disabled={card.status !== "ACTIVE"}
                  data-testid={`make-payment-${card.id}`}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Make Payment
                </Button>

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(card)}
                      data-testid={`delete-card-${card.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Card</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this {cardToDelete?.scheme} card ending in {cardToDelete?.cardNumber.slice(-4)}? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
