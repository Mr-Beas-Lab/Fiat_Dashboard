import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Transaction } from "../../types";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.amount.toFixed(2)}</TableCell>
            <TableCell>{transaction.currency}</TableCell>
            <TableCell>{transaction.type}</TableCell>
            <TableCell>{transaction.status}</TableCell>
            <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}