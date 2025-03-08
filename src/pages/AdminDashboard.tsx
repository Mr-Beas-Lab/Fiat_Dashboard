"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firebaseConfig"
import type { Ambassador, Receipt, Transaction } from "../types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import AmbassadorList from "../components/AmbassadorList"
import AmbassadorForm from "../components/AmbassadorForm"
import ReceiptList from "../components/ReceiptList"
import TransactionList from "../components/TransactionList"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { UserPlus, Users, ReceiptIcon, CreditCard } from "lucide-react"

const AdminDashboard: React.FC = () => {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false)
  const [currentAmbassador, setCurrentAmbassador] = useState<Ambassador | null>(null)
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch ambassadors
        const ambassadorsSnapshot = await getDocs(collection(db, "ambassadors"))
        const ambassadorsData = ambassadorsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Ambassador,
        )
        setAmbassadors(ambassadorsData)

        // Fetch receipts
        const receiptsSnapshot = await getDocs(collection(db, "receipts"))
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
        const transactionsSnapshot = await getDocs(collection(db, "transactions"))
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
  }, [])

  const handleCreateAmbassador = async (ambassadorData: Omit<Ambassador, "id" | "createdAt">) => {
    try {
      const docRef = await addDoc(collection(db, "ambassadors"), {
        ...ambassadorData,
        createdAt: new Date(),
      })

      const newAmbassador: Ambassador = {
        id: docRef.id,
        ...ambassadorData,
        createdAt: new Date(),
      }

      setAmbassadors([...ambassadors, newAmbassador])
      setIsFormOpen(false)
    } catch (error) {
      console.error("Error creating ambassador:", error)
    }
  }

  const handleUpdateAmbassador = async (ambassadorData: Omit<Ambassador, "id" | "createdAt">) => {
    if (!currentAmbassador) return

    try {
      await updateDoc(doc(db, "ambassadors", currentAmbassador.id), ambassadorData)

      const updatedAmbassador: Ambassador = {
        ...currentAmbassador,
        ...ambassadorData,
      }

      setAmbassadors(ambassadors.map((amb) => (amb.id === currentAmbassador.id ? updatedAmbassador : amb)))

      setIsFormOpen(false)
      setCurrentAmbassador(null)
    } catch (error) {
      console.error("Error updating ambassador:", error)
    }
  }

  const handleDeleteAmbassador = async (ambassadorId: string) => {
    if (!confirm("Are you sure you want to delete this ambassador?")) return

    try {
      await deleteDoc(doc(db, "ambassadors", ambassadorId))
      setAmbassadors(ambassadors.filter((amb) => amb.id !== ambassadorId))
    } catch (error) {
      console.error("Error deleting ambassador:", error)
    }
  }

  const handleEditAmbassador = (ambassador: Ambassador) => {
    setCurrentAmbassador(ambassador)
    setIsFormOpen(true)
  }

  const handleViewAmbassador = (ambassador: Ambassador) => {
    setCurrentAmbassador(ambassador)
    setIsViewOpen(true)
  }

  const handleViewReceipt = (receipt: Receipt) => {
    setCurrentReceipt(receipt)
    setIsReceiptViewOpen(true)
  }

  const handleApproveReceipt = async (receiptId: string) => {
    try {
      await updateDoc(doc(db, "receipts", receiptId), { status: "approved" })

      // Find the receipt to get its details
      const receipt = receipts.find((r) => r.id === receiptId)
      if (!receipt) return

      // Create a transaction for the approved receipt
      await addDoc(collection(db, "transactions"), {
        amount: receipt.amount,
        currency: receipt.currency,
        status: "completed",
        ambassadorId: receipt.ambassadorId,
        type: "deposit",
        createdAt: new Date(),
      })

      // Update the local state
      setReceipts(receipts.map((r) => (r.id === receiptId ? { ...r, status: "approved" } : r)))

      // Refresh transactions
      const transactionsSnapshot = await getDocs(collection(db, "transactions"))
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
      console.error("Error approving receipt:", error)
    }
  }

  const handleRejectReceipt = async (receiptId: string) => {
    try {
      await updateDoc(doc(db, "receipts", receiptId), { status: "rejected" })

      // Update the local state
      setReceipts(receipts.map((r) => (r.id === receiptId ? { ...r, status: "rejected" } : r)))
    } catch (error) {
      console.error("Error rejecting receipt:", error)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ambassadors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ambassadors.length}</div>
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
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>

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
      </div>

      <Tabs defaultValue="ambassadors">
        <TabsList className="mb-4">
          <TabsTrigger value="ambassadors">Ambassadors</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="ambassadors" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setCurrentAmbassador(null)
                setIsFormOpen(true)
              }}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Ambassador
            </Button>
          </div>

          <AmbassadorList
            ambassadors={ambassadors}
            onEdit={handleEditAmbassador}
            onDelete={handleDeleteAmbassador}
            onView={handleViewAmbassador}
          />
        </TabsContent>

        <TabsContent value="receipts">
          <ReceiptList
            receipts={receipts}
            isAdmin={true}
            onViewReceipt={handleViewReceipt}
            onApproveReceipt={handleApproveReceipt}
            onRejectReceipt={handleRejectReceipt}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionList transactions={transactions} />
        </TabsContent>
      </Tabs>

      {/* Ambassador Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentAmbassador ? "Edit Ambassador" : "Add New Ambassador"}</DialogTitle>
          </DialogHeader>
          <AmbassadorForm
            ambassador={currentAmbassador || undefined}
            onSubmit={currentAmbassador ? handleUpdateAmbassador : handleCreateAmbassador}
          />
        </DialogContent>
      </Dialog>

      {/* Ambassador View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ambassador Details</DialogTitle>
          </DialogHeader>

          {currentAmbassador && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={currentAmbassador.photoUrl || "/placeholder.svg"}
                    alt={currentAmbassador.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{currentAmbassador.name}</h3>
                    <p className="text-sm text-gray-500">{currentAmbassador.email}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p>{currentAmbassador.phone}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Country</p>
                      <p>{currentAmbassador.country}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm font-medium">Address</p>
                      <p>{currentAmbassador.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  {currentAmbassador.paymentMethods.map((method, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Bank Name</p>
                          <p>{method.bankName}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Account Name</p>
                          <p>{method.accountName}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Account Number</p>
                          <p>{method.accountNumber}</p>
                        </div>

                        {method.swiftCode && (
                          <div>
                            <p className="text-sm font-medium">Swift Code</p>
                            <p>{method.swiftCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewOpen(false)
                    handleEditAmbassador(currentAmbassador)
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                  <p>{currentReceipt.status}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>{formatDate(currentReceipt.createdAt)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Ambassador ID</p>
                  <p>{currentReceipt.ambassadorId}</p>
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

              {currentReceipt.status === "pending" && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      handleRejectReceipt(currentReceipt.id)
                      setIsReceiptViewOpen(false)
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApproveReceipt(currentReceipt.id)
                      setIsReceiptViewOpen(false)
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard

