import * as React from "react";
import { Link } from "react-router-dom";
import * as api from "@/services/api";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ConferenceSettings } from "@/types";
import { Plus, Pencil } from "lucide-react";

function isOpen(c: ConferenceSettings) {
  return new Date(c.abstractDeadline) > new Date();
}

export function ManageConferencePage() {
  const [conferences, setConferences] = React.useState<ConferenceSettings[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.getConferences().then((c) => { setConferences(c); setIsLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Manage Conferences</h1>
        <Button asChild>
          <Link to="/admin/conference/new"><Plus className="h-4 w-4" /> Add Conference</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Abstract Deadline</TableHead>
            <TableHead>Tracks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conferences.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="max-w-xs truncate font-medium">{c.title}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(c.abstractDeadline).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{c.tracks.length}</TableCell>
              <TableCell>
                <Badge variant={isOpen(c) ? "success" : "outline"}>{isOpen(c) ? "Open" : "Closed"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/conference/${c.id}`}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && conferences.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-base text-muted-foreground">
                No conferences yet. Click "Add Conference" to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
