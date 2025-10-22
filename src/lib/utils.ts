import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(.{4})/g, '$1 ').trim()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function generateCardNumber(): string {
  // Generate a 16-digit card number
  let cardNumber = ''
  for (let i = 0; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString()
  }
  return cardNumber
}

export function generateCVV(): string {
  // Generate a 3-digit CVV
  let cvv = ''
  for (let i = 0; i < 3; i++) {
    cvv += Math.floor(Math.random() * 10).toString()
  }
  return cvv
}
