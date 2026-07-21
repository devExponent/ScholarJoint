import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const COUNTRIES = ["Finland", "Nigeria", "Ghana", "Italy", "Spain", "China", "United States", "United Kingdom", "Other"];

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    institution: "", department: "", country: "", orcid: "", phone: "", agree: false,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return "Password must be at least 8 characters with 1 uppercase letter and 1 number.";
    }
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (!form.institution || !form.department) return "Institution and department are required.";
    if (!form.country) return "Please select your country.";
    if (!form.agree) return "You must agree to the terms and privacy policy.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    setError(null);
    setIsSubmitting(true);
    try {
      await api.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        institution: form.institution,
        department: form.department,
        country: form.country,
        orcid: form.orcid || undefined,
        phone: form.phone || undefined,
        role: "author",
      });
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2">
          <BookOpen className="h-6 w-6 text-accent" />
          <span className="font-display text-xl font-semibold">Scholarjoint</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Register as an author to submit to the conference.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={form.password} onChange={(e) => update("password", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="institution">Institution</Label>
                  <Input id="institution" required value={form.institution} onChange={(e) => update("institution", e.target.value)} placeholder="University of Turku" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" required value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="Dept. of Computing" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    required
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select...</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="orcid">ORCID (optional)</Label>
                  <Input id="orcid" value={form.orcid} onChange={(e) => update("orcid", e.target.value)} placeholder="0000-0000-0000-0000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <label className="flex items-start gap-2 text-base text-muted-foreground">
                <input type="checkbox" className="mt-0.5" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} />
                I agree to the terms and privacy policy.
              </label>
              {error && <p className="text-base text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Register"}
              </Button>
            </form>
            <p className="mt-4 text-center text-base text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
