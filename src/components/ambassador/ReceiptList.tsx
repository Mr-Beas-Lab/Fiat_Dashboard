"use client"

import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Eye, Check, X } from "lucide-react"
import { formatDate } from "../../lib/utils"
import { Receipt } from "../../types"

interface ReceiptListProps {
  receipts: Receipt[]
  isAdmin?: boolean
  onViewReceipt?: (receipt: Receipt) => void
  onApproveReceipt?: (receiptId: string) => void
  onRejectReceipt?: (receiptId: string) => void
}

const ReceiptList: React.FC<ReceiptListProps> = ({
  receipts,
  isAdmin = false,
  onViewReceipt,
  onApproveReceipt,
  onRejectReceipt,
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Receipts</h2>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No receipts found
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.id.slice(0, 8)}</TableCell>
                  <TableCell>{receipt.amount.toFixed(2)}</TableCell>
                  <TableCell>{receipt.currency}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        receipt.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : receipt.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {receipt.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {onViewReceipt && (
                        <Button variant="outline" size="sm" onClick={() => onViewReceipt(receipt)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {isAdmin && receipt.status === "pending" && (
                        <>
                          {onApproveReceipt && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => onApproveReceipt(receipt.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}

                          {onRejectReceipt && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => onRejectReceipt(receipt.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      
    </div>
  )
}

export default ReceiptList

