# ZBank - Digital Banking Platform

A modern, full-featured digital banking platform built with Next.js, TypeScript, and Prisma. ZBank provides comprehensive banking services including card management, payments, transfers, and value-added services.

## 🚀 Features

### Core Banking Features
- **User Authentication**: Secure sign-in/sign-up with NextAuth and JWT
- **Card Management**: Create and manage virtual and physical debit cards
- **Transaction Processing**: Handle payments, refunds, and transfers
- **Money Transfers**: Send money to other users via email
- **Account Balance**: Track spending and available funds

### Value Added Services (VAS)
- **Mobile Recharge**: Top up mobile phone balances
- **Bill Payments**: Pay electricity, gas, water, internet, and cable TV bills
- **Insurance Premiums**: Pay insurance policies
- **Education Fees**: Pay school and college fees
- **Healthcare**: Pay medical bills
- **Transportation**: Pay for transport services

### Card Features
- **Virtual & Physical Cards**: Support for both card types
- **Card Controls**: Freeze/unfreeze cards, set daily limits
- **Secure Generation**: Auto-generated card numbers, CVVs, and expiry dates
- **Multi-Scheme Support**: Visa, Mastercard, and other schemes

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Validation**: Zod schemas with React Hook Form
- **Security**: bcryptjs for password hashing
- **Email**: Nodemailer for notifications
- **State Management**: React hooks and context

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- SQLite (included with Prisma)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/mahbd/zbank.git
   cd zbank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
zbank/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication routes
│   │   │   ├── cards/         # Card management
│   │   │   ├── transactions/  # Transaction handling
│   │   │   └── transfers/     # Money transfers
│   │   ├── auth/              # Authentication pages
│   │   ├── components/        # React components
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard page
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Radix UI components
│   │   └── ...                # Feature components
│   └── lib/                   # Utility libraries
│       ├── auth.ts            # NextAuth configuration
│       ├── db.ts              # Prisma client
│       ├── utils.ts           # Helper functions
│       └── validations.ts     # Zod schemas
├── public/                    # Static assets
└── package.json               # Dependencies and scripts
```

## 🗄️ Database Schema

The application uses Prisma with SQLite and includes the following models:

- **User**: User accounts with authentication
- **Account**: OAuth account linking
- **Session**: User sessions
- **VerificationToken**: Email verification
- **Card**: Debit cards (virtual and physical)
- **Transaction**: Payment and transfer records

## 🔐 Authentication

ZBank uses NextAuth.js for authentication with:
- Credentials provider for email/password login
- JWT tokens for session management
- Protected routes with middleware
- Password hashing with bcryptjs

## 💳 Card Management

### Creating Cards
- **Virtual Cards**: Instant creation, no physical delivery
- **Physical Cards**: Requires delivery address
- **Auto-generation**: Card numbers, CVVs, and expiry dates
- **Customizable**: Cardholder name, daily limits, PIN

### Card Operations
- **Freeze/Unfreeze**: Temporarily disable cards
- **Delete Cards**: Permanently remove cards
- **Balance Tracking**: Real-time balance updates

## 💰 Transactions & Payments

### Transaction Types
- **Payments**: General payments
- **Bill Payments**: Utilities, services
- **Mobile Recharge**: Phone top-ups
- **Transfers**: Money to other users
- **Refunds**: Payment reversals

### Transfer Features
- **Email-based**: Send money using recipient's email
- **Card-to-Card**: Direct card transfers
- **Account Balance**: Transfer to recipient's account
- **Instant Processing**: Real-time transfers

## 🛍️ Value Added Services

ZBank integrates various bill payment services:
- **Utilities**: Electricity, gas, water, internet
- **Communication**: Mobile recharge, cable TV
- **Insurance**: Premium payments
- **Education**: School/college fees
- **Healthcare**: Medical bill payments
- **Transport**: Transportation services

## 🎨 UI/UX

- **Modern Design**: Clean, responsive interface
- **Dark/Light Mode**: Theme switching support
- **Mobile-First**: Responsive design
- **Accessibility**: ARIA labels and keyboard navigation
- **Toast Notifications**: User feedback with Sonner

## 🧪 Testing

The application includes comprehensive testing:
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API route testing
- **E2E Tests**: Full user flow testing
- **Test Coverage**: 80%+ code coverage

## 🚀 Deployment

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

### Build Commands
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@zbank.com or join our Discord community.

## 🔄 Future Enhancements

- [ ] Multi-currency support
- [ ] International transfers
- [ ] Investment portfolio
- [ ] Loan management
- [ ] Credit score integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Biometric authentication
- [ ] QR code payments
- [ ] Budget tracking
- [ ] Recurring payments

---

Built with ❤️ using Next.js and TypeScript