import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Receipt } from "../../types";

interface ReceiptViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
  onApprove: (receiptId: string) => void;
  onReject: (receiptId: string) => void;
}

export default function ReceiptViewDialog({
  isOpen,
  onOpenChange,
  receipt,
  onApprove,
  onReject,
}: ReceiptViewDialogProps) {
  if (!receipt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receipt Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Receipt details here */}
          {receipt.status === "pending" && (
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => {
                  onReject(receipt.id);
                  onOpenChange(false);
                }}
              >
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  onApprove(receipt.id);
                  onOpenChange(false);
                }}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}