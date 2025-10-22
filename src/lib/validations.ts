import { z } from 'zod'

export const createCardSchema = z.object({
  cardType: z.enum(['PHYSICAL', 'VIRTUAL']),
  scheme: z.string().min(1, 'Scheme is required'),
  cardholderName: z.string().min(2, 'Cardholder name must be at least 2 characters').optional(),
  creditLimit: z.number().min(0).optional(),
  dailyLimit: z.number().min(100, 'Daily limit must be at least $100').max(10000, 'Daily limit cannot exceed $10,000'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits').optional(),
  // Delivery information (required for physical cards)
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryZipCode: z.string().optional(),
  deliveryCountry: z.string().optional(),
}).refine((data) => {
  // If physical card, delivery address is required
  if (data.cardType === 'PHYSICAL') {
    return data.deliveryAddress && data.deliveryCity && data.deliveryState && data.deliveryZipCode && data.deliveryCountry;
  }
  return true;
}, {
  message: "Delivery address is required for physical cards",
  path: ["deliveryAddress"],
});

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['PAYMENT', 'REFUND', 'TOP_UP', 'BILL_PAYMENT', 'MOBILE_RECHARGE', 'QR_PAYMENT', 'INTERNET_BILL', 'ELECTRICITY_BILL', 'GAS_BILL', 'WATER_BILL', 'CABLE_TV', 'INSURANCE', 'EDUCATION_FEES', 'HEALTHCARE', 'TRANSPORT']),
  description: z.string().min(1, 'Description is required'),
  merchantName: z.string().optional(),
  category: z.string().optional(),
})

export const cardStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'FROZEN', 'BLOCKED']),
})

export type CreateCardInput = z.infer<typeof createCardSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type CardStatusInput = z.infer<typeof cardStatusSchema>

export const paymentSchema = transactionSchema.extend({
  cardId: z.string().min(1, 'Card is required'),
})

export type PaymentInput = z.infer<typeof paymentSchema>
