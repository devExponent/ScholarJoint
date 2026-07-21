import * as React from "react";
import * as api from "@/services/api";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Payment } from "@/types";

export function AdminPaymentsPage() {
  const [payments, setPayments] = React.useState<Payment[]>([]);

  const load = React.useCallback(() => { api.getPayments().then(setPayments); }, []);
  React.useEffect(() => { load(); }, [load]);

  const handleMarkPaid = async (id: string) => {
    await api.markPaymentPaid(id);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">Payments</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paper ID</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-sm">{p.submissionId}</TableCell>
              <TableCell className="font-medium">{p.authorName}</TableCell>
              <TableCell>${p.amount}</TableCell>
              <TableCell>
                <Badge variant={p.status === "paid" ? "success" : p.status === "pending" ? "warning" : "destructive"}>{p.status}</Badge>
              </TableCell>
              <TableCell className="text-base text-muted-foreground">{p.transactionId ?? "—"}</TableCell>
              <TableCell className="text-base text-muted-foreground">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</TableCell>
              <TableCell className="text-right">
                {p.status !== "paid" && <Button size="sm" onClick={() => handleMarkPaid(p.id)}>Mark as Paid</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
