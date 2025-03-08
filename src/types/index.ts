// Define types for our application
export interface Receipt {
    id: string
    amount: number
    currency: string
    status: string
    ambassadorId?: string
    imageUrl?: string
    createdAt: Date
  }
  
  export interface Transaction {
    id: string
    amount: number
    currency: string
    status: string
    ambassadorId?: string
    type: "deposit" | "withdrawal"
    createdAt: Date
  }
  
  export interface PaymentMethod {
    id: string
    bankName: string
    accountNumber: string
    accountName: string
    swiftCode?: string
  }
  
  export interface Ambassador {
    id: string
    name: string
    email: string
    phone: string
    address: string
    photoUrl: string
    country: string
    paymentMethods: PaymentMethod[]
    createdAt: Date
  }
  
  