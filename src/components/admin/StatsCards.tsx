import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, ReceiptIcon, CreditCard, UserCheck } from "lucide-react"; // Import UserCheck icon for KYC

interface StatsCardsProps {
  ambassadorsCount: number;
  pendingReceiptsCount: number;
  transactionsCount: number;
  totalDeposits: number;
  pendingKYCCount: number; // Add pendingKYCCount to the interface
}

export default function StatsCards({
  ambassadorsCount,
  pendingReceiptsCount,
  transactionsCount,
  totalDeposits,
  pendingKYCCount, // Destructure the new prop
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ambassadors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ambassadorsCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Receipts</CardTitle>
          <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingReceiptsCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactionsCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDeposits.toFixed(2)} USD</div>
        </CardContent>
      </Card>

      {/* Add a new card for pending KYC applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" /> {/* Use UserCheck icon for KYC */}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingKYCCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}