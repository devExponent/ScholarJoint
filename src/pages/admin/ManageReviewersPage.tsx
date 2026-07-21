import * as React from "react";
import * as api from "@/services/api";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import type { User } from "@/types";
import { Plus } from "lucide-react";

export function ManageReviewersPage() {
  const [reviewers, setReviewers] = React.useState<User[]>([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ firstName: "", lastName: "", email: "", institution: "", department: "", country: "", expertise: "" });
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const load = React.useCallback(() => { api.getUsers("reviewer").then(setReviewers); }, []);
  React.useEffect(() => { load(); }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.inviteReviewer({
      firstName: form.firstName, lastName: form.lastName, email: form.email,
      institution: form.institution, department: form.department, country: form.country,
      expertise: form.expertise.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setSuccessMsg(`Invitation sent to ${created.firstName} ${created.lastName} (${created.email}).`);
    setForm({ firstName: "", lastName: "", email: "", institution: "", department: "", country: "", expertise: "" });
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Manage Reviewers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Invite Reviewer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite Reviewer</DialogTitle></DialogHeader>
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>First name</Label><Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Last name</Label><Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Institution</Label><Input required value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Department</Label><Input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Expertise (comma-separated)</Label><Input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} placeholder="AI, Healthcare" /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Send Invitation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {successMsg && <div className="rounded-md bg-success/10 px-4 py-2 text-base text-success">{successMsg}</div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Affiliation</TableHead>
            <TableHead>Expertise</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviewers.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.firstName} {r.lastName}</TableCell>
              <TableCell className="text-base text-muted-foreground">{r.email}</TableCell>
              <TableCell className="text-base text-muted-foreground">{r.institution}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {r.expertise?.map((e) => <Badge key={e} variant="secondary">{e}</Badge>)}
                </div>
              </TableCell>
              <TableCell><Badge variant={r.status === "active" ? "success" : "outline"}>{r.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
