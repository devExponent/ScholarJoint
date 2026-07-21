import * as React from "react";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Submission } from "@/types";

export function AuthorPaymentsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);

  React.useEffect(() => {
    if (!user) return;
    api.getSubmissions({ ownerId: user.id }).then((all) =>
      setSubmissions(all.filter((s) => s.paymentStatus !== "not_applicable"))
    );
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">Payments</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paper ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-sm">{s.id}</TableCell>
              <TableCell className="max-w-xs truncate font-medium">{s.title}</TableCell>
              <TableCell>${s.feeAmount ?? 150}</TableCell>
              <TableCell>
                <Badge variant={s.paymentStatus === "paid" ? "success" : s.paymentStatus === "pending" ? "warning" : "destructive"}>
                  {s.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {s.paymentStatus === "paid" ? (
                  <Button variant="outline" size="sm">Download Invoice</Button>
                ) : (
                  <Button size="sm">Pay Now</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {submissions.length === 0 && (
            <TableRow><TableCell colSpan={5} className="py-10 text-center text-base text-muted-foreground">No payments due.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
