import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  merchantName?: string
  status: string
  createdAt: string
}

interface TransactionsListProps {
  transactions: Transaction[]
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6" data-testid="transactions-section-title">
        Recent Transactions
      </h2>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 flex items-center justify-between"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.amount > 0
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    
                    {transaction.merchantName && (
                      <p className="text-sm text-gray-500">
                        {transaction.merchantName}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400" data-testid={`transaction-description-${transaction.id}`}>
                      Description: {transaction.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`} data-testid={`transaction-amount-${transaction.id}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.status.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}