import * as React from "react";
import { useNavigate } from "react-router-dom";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { CoAuthor, ConferenceSettings } from "@/types";
import { Plus, X, Pencil, Star, CalendarClock } from "lucide-react";

const emptyCoAuthor = (): CoAuthor => ({
  id: `draft-${Math.random().toString(36).slice(2, 9)}`,
  givenName: "", familyName: "", displayName: "", title: "",
  affiliation: { institution: "", department: "", country: "" },
  email: "",
});

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function NewSubmissionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [openConferences, setOpenConferences] = React.useState<ConferenceSettings[]>([]);
  const [conferencesLoading, setConferencesLoading] = React.useState(true);
  const [conferenceId, setConferenceId] = React.useState<string>("");

  const [title, setTitle] = React.useState("");
  const [track, setTrack] = React.useState("");
  const [keywordInput, setKeywordInput] = React.useState("");
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [abstractText, setAbstractText] = React.useState("");
  const [coAuthors, setCoAuthors] = React.useState<CoAuthor[]>([]);
  const [correspondingId, setCorrespondingId] = React.useState<string>("primary");
  const [consents, setConsents] = React.useState({ original: false, coauthorConsent: false, policy: false });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCoAuthor, setEditingCoAuthor] = React.useState<CoAuthor | null>(null);

  React.useEffect(() => {
    api.getOpenConferences().then((confs) => {
      setOpenConferences(confs);
      setConferencesLoading(false);
    });
  }, []);

  const selectedConference = openConferences.find((c) => c.id === conferenceId) ?? null;
  const maxAbstractWords = selectedConference?.maxAbstractWords ?? 300;
  const wordCount = abstractText.trim() ? abstractText.trim().split(/\s+/).length : 0;

  const handleSelectConference = (id: string) => {
    setConferenceId(id);
    setTrack(""); // tracks differ per conference - reset selection
    setErrors((e) => ({ ...e, conference: "", track: "" }));
  };

  const primaryAuthor: CoAuthor = {
    id: "primary",
    givenName: user?.firstName ?? "",
    familyName: user?.lastName ?? "",
    displayName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
    affiliation: { institution: user?.institution ?? "", department: user?.department ?? "", country: user?.country ?? "" },
    email: user?.email ?? "",
  };

  const allAuthors = [primaryAuthor, ...coAuthors];

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && keywords.length < 5 && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  };

  const openAddCoAuthor = () => {
    setEditingCoAuthor(emptyCoAuthor());
    setModalOpen(true);
  };

  const openEditCoAuthor = (ca: CoAuthor) => {
    setEditingCoAuthor({ ...ca });
    setModalOpen(true);
  };

  const saveCoAuthor = () => {
    if (!editingCoAuthor) return;
    const emailTaken = allAuthors.some((a) => a.id !== editingCoAuthor.id && a.email.toLowerCase() === editingCoAuthor.email.toLowerCase());
    if (emailTaken) {
      setErrors((e) => ({ ...e, coauthor: "This email is already listed as an author." }));
      return;
    }
    const exists = coAuthors.some((c) => c.id === editingCoAuthor.id);
    setCoAuthors(exists ? coAuthors.map((c) => (c.id === editingCoAuthor.id ? editingCoAuthor : c)) : [...coAuthors, editingCoAuthor]);
    setErrors((e) => ({ ...e, coauthor: "" }));
    setModalOpen(false);
    setEditingCoAuthor(null);
  };

  const removeCoAuthor = (id: string) => {
    setCoAuthors(coAuthors.filter((c) => c.id !== id));
    if (correspondingId === id) setCorrespondingId("primary");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!conferenceId) errs.conference = "Please select a conference to submit to.";
    if (!title.trim() || title.length > 250) errs.title = "Please provide a title (max 250 characters).";
    if (!track) errs.track = "Please select a track.";
    if (keywords.length < 1) errs.keywords = "Enter at least 1 keyword (recommended 3-5).";
    if (wordCount < 50 || wordCount > maxAbstractWords) {
      errs.abstract = `Abstract must be between 50 and ${maxAbstractWords} words (current: ${wordCount}).`;
    }
    if (!consents.original || !consents.coauthorConsent || !consents.policy) {
      errs.consent = "All consent checkboxes must be checked.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user || !selectedConference) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const authorsWithCorresponding = allAuthors.map((a) => ({ ...a, isCorresponding: a.id === correspondingId }));
      const sub = await api.createSubmission({
        conferenceId: selectedConference.id,
        title, track, type: "abstract", status: "abstract_submitted",
        keywords, abstractText, authors: authorsWithCorresponding,
        correspondingEmail: authorsWithCorresponding.find((a) => a.isCorresponding)?.email ?? primaryAuthor.email,
        files: [], reviewerIds: [], ownerId: user.id, paymentStatus: "not_applicable",
      });
      navigate(`/author/submissions/${sub.id.replace("#", "")}`, { state: { justSubmitted: true } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent">Step 1 of 1</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Submit Abstract</h1>
        <p className="text-base text-muted-foreground">
          {selectedConference ? selectedConference.title : "Choose a conference to get started."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conference</CardTitle>
          <CardDescription>Only conferences still accepting abstracts are listed here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {conferencesLoading ? (
            <p className="text-base text-muted-foreground">Loading conferences...</p>
          ) : openConferences.length === 0 ? (
            <p className="text-base text-muted-foreground">
              There are no conferences currently open for abstract submission. Check back later, or contact the conference organizers.
            </p>
          ) : (
            <>
              <Select value={conferenceId} onValueChange={handleSelectConference}>
                <SelectTrigger><SelectValue placeholder="Select a conference..." /></SelectTrigger>
                <SelectContent>
                  {openConferences.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.conference && <p className="text-sm text-destructive">{errors.conference}</p>}
              {selectedConference && (
                <div className="flex items-start gap-2 rounded-md bg-secondary/50 p-3 text-sm text-muted-foreground">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Abstract deadline: <span className="font-medium text-foreground">{formatDeadline(selectedConference.abstractDeadline)}</span>
                    {" · "}Max {selectedConference.maxAbstractWords} words
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedConference && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title of submission</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter the full title as it should appear in the proceedings" />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Track</Label>
                <Select value={track} onValueChange={setTrack}>
                  <SelectTrigger><SelectValue placeholder="Select a track..." /></SelectTrigger>
                  <SelectContent>
                    {selectedConference.tracks.map((t) => (
                      <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.track && <p className="text-sm text-destructive">{errors.track}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                    placeholder="Type a keyword and press Enter"
                  />
                  <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="gap-1">
                      {kw}
                      <button type="button" onClick={() => setKeywords(keywords.filter((k) => k !== kw))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.keywords && <p className="text-sm text-destructive">{errors.keywords}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="abstract">Abstract text</Label>
                  <span className={`text-sm ${wordCount > maxAbstractWords ? "text-destructive" : "text-muted-foreground"}`}>
                    {wordCount} / {maxAbstractWords} words
                  </span>
                </div>
                <Textarea id="abstract" rows={8} value={abstractText} onChange={(e) => setAbstractText(e.target.value)} placeholder="Summarize your research..." />
                {errors.abstract && <p className="text-sm text-destructive">{errors.abstract}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
              <div>
                <CardTitle>Authors</CardTitle>
                <CardDescription>Add co-authors and set the corresponding author.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={openAddCoAuthor}>
                <Plus className="h-4 w-4" /> Add co-author
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {allAuthors.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrespondingId(a.id)}
                      title="Set as corresponding author"
                      className={cn("shrink-0", correspondingId === a.id ? "text-accent" : "text-muted-foreground hover:text-accent")}
                    >
                      <Star className="h-4 w-4" fill={correspondingId === a.id ? "currentColor" : "none"} />
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-medium">
                        <span className="truncate">{a.displayName || `${a.givenName} ${a.familyName}`}</span>
                        {a.id === "primary" && <span className="text-sm font-normal text-muted-foreground">(you)</span>}
                        {correspondingId === a.id && <Badge variant="accent">Corresponding</Badge>}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">{a.affiliation.institution || "—"} · {a.email || "—"}</div>
                    </div>
                  </div>
                  {a.id !== "primary" && (
                    <div className="flex shrink-0 gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEditCoAuthor(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCoAuthor(a.id)}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Consent</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <label className="flex items-start gap-2 text-base">
                <input type="checkbox" className="mt-0.5" checked={consents.original} onChange={(e) => setConsents({ ...consents, original: e.target.checked })} />
                I confirm this submission is original and not under review elsewhere.
              </label>
              <label className="flex items-start gap-2 text-base">
                <input type="checkbox" className="mt-0.5" checked={consents.coauthorConsent} onChange={(e) => setConsents({ ...consents, coauthorConsent: e.target.checked })} />
                I confirm all listed co-authors consent to this submission.
              </label>
              <label className="flex items-start gap-2 text-base">
                <input type="checkbox" className="mt-0.5" checked={consents.policy} onChange={(e) => setConsents({ ...consents, policy: e.target.checked })} />
                I agree to the conference privacy & copyright policy.
              </label>
              {errors.consent && <p className="text-sm text-destructive">{errors.consent}</p>}
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              {submitError && <p className="text-base text-destructive">{submitError}</p>}
              <div className="ml-auto flex gap-2">
                <Button type="button" variant="outline" onClick={() => navigate("/author")}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Abstract"}</Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{coAuthors.some((c) => c.id === editingCoAuthor?.id) ? "Edit co-author" : "Add co-author"}</DialogTitle>
          </DialogHeader>
          {editingCoAuthor && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Given name</Label>
                  <Input value={editingCoAuthor.givenName} onChange={(e) => setEditingCoAuthor({ ...editingCoAuthor, givenName: e.target.value, displayName: `${e.target.value} ${editingCoAuthor.familyName}`.trim() })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Family name</Label>
                  <Input value={editingCoAuthor.familyName} onChange={(e) => setEditingCoAuthor({ ...editingCoAuthor, familyName: e.target.value, displayName: `${editingCoAuthor.givenName} ${e.target.value}`.trim() })} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Institution</Label>
                  <Input value={editingCoAuthor.affiliation.institution} onChange={(e) => setEditingCoAuthor({ ...editingCoAuthor, affiliation: { ...editingCoAuthor.affiliation, institution: e.target.value } })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input value={editingCoAuthor.affiliation.department} onChange={(e) => setEditingCoAuthor({ ...editingCoAuthor, affiliation: { ...editingCoAuthor.affiliation, department: e.target.value } })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editingCoAuthor.email} onChange={(e) => setEditingCoAuthor({ ...editingCoAuthor, email: e.target.value })} />
              </div>
              {errors.coauthor && <p className="text-sm text-destructive">{errors.coauthor}</p>}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveCoAuthor}>Save co-author</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
