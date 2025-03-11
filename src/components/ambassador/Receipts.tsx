import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ReceiptList from "../ambassador/ReceiptList";
import { ReceiptIcon } from "lucide-react";
import { Receipt } from "../../types";

interface ReceiptsProps {
  receipts: Receipt[];
  onViewReceipt: (receipt: Receipt) => void;
}

const Receipts: React.FC<ReceiptsProps> = ({ receipts, onViewReceipt }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">My Receipts</CardTitle>
        <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ReceiptList receipts={receipts} onViewReceipt={onViewReceipt} />
      </CardContent>
    </Card>
  );
};

export default Receipts;