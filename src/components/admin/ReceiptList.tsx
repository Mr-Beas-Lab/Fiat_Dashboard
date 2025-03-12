import { Receipt } from "../../types";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { EyeIcon, CheckIcon, XIcon } from "lucide-react";

interface ReceiptListProps {
  receipts: Receipt[];
  isAdmin?: boolean;
  onViewReceipt: (receipt: Receipt) => void;
  onApproveReceipt?: (receiptId: string) => void;
  onRejectReceipt?: (receiptId: string) => void;
}

export default function ReceiptList({
  receipts,
  isAdmin = false,
  onViewReceipt,
  onApproveReceipt,
  onRejectReceipt,
}: ReceiptListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receipts.map((receipt) => (
          <TableRow key={receipt.id}>
            <TableCell>{receipt.amount.toFixed(2)}</TableCell>
            <TableCell>{receipt.currency}</TableCell>
            <TableCell>{receipt.status}</TableCell>
            <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={() => onViewReceipt(receipt)}>
                <EyeIcon className="h-4 w-4" />
              </Button>
              {isAdmin && receipt.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:bg-green-50"
                    onClick={() => onApproveReceipt?.(receipt.id)}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => onRejectReceipt?.(receipt.id)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}