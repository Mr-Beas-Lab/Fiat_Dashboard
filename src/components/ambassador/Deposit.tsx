import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import DepositForm from "../ambassador/DepositForm";
import { CreditCard } from "lucide-react";

interface DepositProps {
  onSubmit: (amount: number, currency: string, receiptImage: File) => Promise<void>;
}

const Deposit: React.FC<DepositProps> = ({ onSubmit }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Make Deposit</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="max-w-md mx-auto">
          <DepositForm onSubmit={onSubmit} />
        </div>
      </CardContent>
    </Card>
  );
};

export default Deposit;
