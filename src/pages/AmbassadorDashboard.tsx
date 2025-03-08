"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { collection, getDocs, query, where, addDoc, doc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../firebase/firebaseConfig"
import type { Ambassador, Receipt, Transaction } from "../types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import ReceiptList from "../components/ReceiptList"
import TransactionList from "../components/TransactionList"
import DepositForm from "../components/DepositForm"
import { CreditCard, ReceiptIcon, Upload } from "lucide-react"

const AmbassadorDashboard: React.FC = () => {
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)

  // In a real app, this would come from authentication
  const ambassadorId = "AMBASSADOR_ID"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch ambassador data
        const ambassadorDoc = await getDoc(doc(db, "ambassadors", ambassadorId))
        if (ambassadorDoc.exists()) {
          setAmbassador({
            id: ambassadorDoc.id,
            ...ambassadorDoc.data(),
          } as Ambassador)
        }

        // Fetch receipts
        const receiptsQuery = query(collection(db, "receipts"), where("ambassadorId", "==", ambassadorId))
        const receiptsSnapshot = await getDocs(receiptsQuery)
        const receiptsData = receiptsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }) as Receipt,
        )
        setReceipts(receiptsData)

        // Fetch transactions
        const transactionsQuery = query(collection(db, "transactions"), where("ambassadorId", "==", ambassadorId))
        const transactionsSnapshot = await getDocs(transactionsQuery)
        const transactionsData = transactionsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }) as Transaction,
        )
        setTransactions(transactionsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [ambassadorId])

  const handleViewReceipt = (receipt: Receipt) => {
    setCurrentReceipt(receipt)
    setIsReceiptViewOpen(true)
  }

  const handleSubmitDeposit = async (amount: number, currency: string, receiptImage: File) => {
    try {
      // Upload receipt image to storage
      const storageRef = ref(storage, `receipts/${ambassadorId}/${Date.now()}_${receiptImage.name}`)
      const uploadResult = await uploadBytes(storageRef, receiptImage)
      const imageUrl = await getDownloadURL(uploadResult.ref)

      // Create receipt document
      const receiptData = {
        amount,
        currency,
        status: "pending",
        ambassadorId,
        imageUrl,
        createdAt: new Date(),
      }

      const docRef = await addDoc(collection(db, "receipts"), receiptData)

      // Update local state
      const newReceipt: Receipt = {
        id: docRef.id,
        ...receiptData,
      }

      setReceipts([...receipts, newReceipt])

      return docRef.id
    } catch (error) {
      console.error("Error submitting deposit:", error)
      throw error
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ambassador Dashboard</h1>

      {ambassador && (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            <img
              src={ambassador.photoUrl || "/placeholder.svg"}
              alt={ambassador.name}
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{ambassador.name}</h2>
            <p className="text-gray-500 mb-4">{ambassador.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p>{ambassador.phone}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Country</p>
                <p>{ambassador.country}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions
                .filter((t) => t.type === "deposit" && t.status === "completed")
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}{" "}
              USD
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Receipts</CardTitle>
            <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receipts.filter((r) => r.status === "pending").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Receipts</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receipts.filter((r) => r.status === "approved").length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deposit">
        <TabsList className="mb-4">
          <TabsTrigger value="deposit">Make Deposit</TabsTrigger>
          <TabsTrigger value="receipts">My Receipts</TabsTrigger>
          <TabsTrigger value="transactions">My Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <div className="max-w-md mx-auto">
            <DepositForm onSubmit={handleSubmitDeposit} />
          </div>
        </TabsContent>

        <TabsContent value="receipts">
          <ReceiptList receipts={receipts} onViewReceipt={handleViewReceipt} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList transactions={transactions} />
        </TabsContent>
      </Tabs>

      {/* Receipt View Dialog */}
      <Dialog open={isReceiptViewOpen} onOpenChange={setIsReceiptViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>

          {currentReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p>
                    {currentReceipt.amount.toFixed(2)} {currentReceipt.currency}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p
                    className={`px-2 py-1 rounded-full text-xs inline-block ${
                      currentReceipt.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : currentReceipt.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentReceipt.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>{new Date(currentReceipt.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {currentReceipt.imageUrl && (
                <div>
                  <p className="text-sm font-medium mb-2">Receipt Image</p>
                  <img
                    src={currentReceipt.imageUrl || "/placeholder.svg"}
                    alt="Receipt"
                    className="max-h-64 mx-auto rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AmbassadorDashboard

