"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Plus,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCardSchema,
  type CreateCardInput,
  paymentSchema,
  type PaymentInput,
} from "@/lib/validations";
import { CardCreationDialog } from "@/components/CardCreationDialog";
import { PaymentDialog } from "@/components/PaymentDialog";
import { TransferDialog } from "@/components/TransferDialog";
import { CardsList } from "@/components/CardsList";
import { TransactionsList } from "@/components/TransactionsList";
import { VASServices } from "@/components/VASServices";
import { toast } from "sonner";

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
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  merchantName?: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<BankCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [createVirtualCardOpen, setCreateVirtualCardOpen] = useState(false);
  const [createPhysicalCardOpen, setCreatePhysicalCardOpen] = useState(false);
  const [makePaymentOpen, setMakePaymentOpen] = useState(false);
  const [makeTransferOpen, setMakeTransferOpen] = useState(false);
  const [selectedVASService, setSelectedVASService] = useState<{
    id: string;
    name: string;
    description: string;
    minAmount: number;
    maxAmount: number;
  } | null>(null);

  const createCardForm = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      cardType: "VIRTUAL",
      scheme: "Visa",
      cardholderName: "",
      dailyLimit: 1000,
      deliveryAddress: "",
      deliveryCity: "",
      deliveryState: "",
      deliveryZipCode: "",
      deliveryCountry: "",
    },
  });

  const paymentForm = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      type: "PAYMENT",
      description: "",
      cardId: "",
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cardsRes, transactionsRes] = await Promise.all([
        fetch("/api/cards"),
        fetch("/api/transactions"),
      ]);

      let cardsData = [];
      if (cardsRes.ok) {
        cardsData = await cardsRes.json();
        // Ensure cardsData is an array
        if (!Array.isArray(cardsData)) {
          cardsData = [];
        }
      } else {
        console.error("Failed to fetch cards:", cardsRes.statusText);
      }

      let transactionsData = [];
      if (transactionsRes.ok) {
        transactionsData = await transactionsRes.json();
        // Ensure transactionsData is an array
        if (!Array.isArray(transactionsData)) {
          transactionsData = [];
        }
      } else {
        console.error(
          "Failed to fetch transactions:",
          transactionsRes.statusText
        );
      }

      setCards(cardsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      setCards([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (data: CreateCardInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const newCard = await response.json();
        setCards([...cards, { ...newCard, transactions: [] }]);
        setCreateVirtualCardOpen(false);
        setCreatePhysicalCardOpen(false);
        createCardForm.reset();
        toast.success("Card created successfully!");
      } else {
        toast.error("Failed to create card");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Error creating card");
    } finally {
      setLoading(false);
    }
  };

  const toggleCardStatus = async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const newStatus = card.status === "ACTIVE" ? "FROZEN" : "ACTIVE";
    try {
      const response = await fetch(`/api/cards/${cardId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setCards(
          cards.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c))
        );
        toast.success(`Card ${newStatus.toLowerCase()} successfully!`);
      } else {
        toast.error("Failed to update card status");
      }
    } catch (error) {
      console.error("Error updating card status:", error);
      toast.error("Error updating card status");
    }
  };

  const makePayment = async (data: PaymentInput) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const newTransaction = await response.json();
        setTransactions([newTransaction, ...transactions]);
        // Update card balance
        setCards(
          cards.map((card) =>
            card.id === data.cardId
              ? { ...card, balance: card.balance - data.amount }
              : card
          )
        );
        setMakePaymentOpen(false);
        setSelectedVASService(null);
        paymentForm.reset();
        toast.success("Payment made successfully!");
      } else {
        toast.error("Failed to make payment");
      }
    } catch (error) {
      console.error("Error making payment:", error);
      toast.error("Error making payment");
    }
  };

  const handleVASServiceSelect = (service: {
    id: string;
    name: string;
    description: string;
    minAmount: number;
    maxAmount: number;
  }) => {
    setSelectedVASService(service);
    // Pre-fill the payment form with VAS service details
    paymentForm.setValue("type", getTransactionTypeFromService(service.id));
    paymentForm.setValue("description", service.name);
    paymentForm.setValue("merchantName", service.name);
    paymentForm.setValue("amount", service.minAmount);
    // Don't set cardId here - user will select in dialog
    paymentForm.setValue("cardId", "");
    setMakePaymentOpen(true);
  };

  const getTransactionTypeFromService = (
    serviceId: string
  ): PaymentInput["type"] => {
    const typeMap: { [key: string]: PaymentInput["type"] } = {
      mobile_recharge: "MOBILE_RECHARGE",
      electricity_bill: "ELECTRICITY_BILL",
      gas_bill: "GAS_BILL",
      water_bill: "WATER_BILL",
      cable_tv: "CABLE_TV",
      internet_bill: "INTERNET_BILL",
      insurance: "INSURANCE",
      education_fees: "EDUCATION_FEES",
      healthcare: "HEALTHCARE",
      transport: "TRANSPORT",
    };
    return typeMap[serviceId] || "PAYMENT";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Middleware will redirect to signin
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6" data-testid="dashboard">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              <section className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className="text-2xl font-semibold"
                    data-testid="cards-section-title"
                  >
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
                    <Button
                      onClick={() => setMakeTransferOpen(true)}
                      disabled={loading}
                      variant="outline"
                      data-testid="transfer-money-btn"
                    >
                      Transfer Money
                    </Button>
                  </div>
                </div>
                <CardsList
                  cards={cards}
                  onToggleStatus={toggleCardStatus}
                  onMakePayment={(cardId) => {
                    paymentForm.setValue("cardId", cardId);
                    setMakePaymentOpen(true);
                  }}
                />
              </section>

              <VASServices onSelectService={handleVASServiceSelect} />

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
        onOpenChange={(open) => {
          setMakePaymentOpen(open);
          if (!open) setSelectedVASService(null);
        }}
        form={paymentForm}
        onSubmit={makePayment}
        loading={loading}
        selectedService={selectedVASService || undefined}
        availableCards={cards}
      />
      <TransferDialog
        open={makeTransferOpen}
        onOpenChange={setMakeTransferOpen}
        availableCards={cards}
      />
    </>
  );
}
