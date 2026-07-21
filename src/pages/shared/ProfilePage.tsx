import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-(\d{3}[\dX])$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = React.useState({
    firstName: user?.firstName ?? "", lastName: user?.lastName ?? "", email: user?.email ?? "",
    institution: user?.institution ?? "", department: user?.department ?? "", country: user?.country ?? "",
    orcid: user?.orcid ?? "", phone: user?.phone ?? "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saved, setSaved] = React.useState(false);

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) errs.email = "Enter a valid email address.";
    if (!form.institution.trim()) errs.institution = "Institution is required.";
    if (!form.department.trim()) errs.department = "Department is required.";
    if (!form.country.trim()) errs.country = "Country is required.";
    if (form.orcid.trim() && !ORCID_PATTERN.test(form.orcid.trim())) {
      errs.orcid = "ORCID must be in the format 0000-0000-0000-0000.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setSaved(false);
      return;
    }
    setSaved(true);
    // In the real app: await api.updateProfile(user.id, form)
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">Profile Settings</h1>
      <Card>
        <form onSubmit={handleSave} noValidate>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Institution</Label>
                <Input value={form.institution} onChange={(e) => update("institution", e.target.value)} />
                {errors.institution && <p className="text-sm text-destructive">{errors.institution}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => update("department", e.target.value)} />
                {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => update("country", e.target.value)} />
                {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>ORCID (optional)</Label>
                <Input value={form.orcid} onChange={(e) => update("orcid", e.target.value)} placeholder="0000-0000-0000-0000" />
                {errors.orcid && <p className="text-sm text-destructive">{errors.orcid}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Phone (optional)</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {saved && <p className="text-base text-success">Profile updated successfully.</p>}
            <Button type="submit" className="ml-auto">Save Profile</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
