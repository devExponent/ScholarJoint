import * as React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { ConferenceSettings, Track } from "@/types";
import { ArrowLeft, Plus, X } from "lucide-react";

function toDateInputValue(iso: string) {
  return iso.slice(0, 16);
}

function blankConference(): ConferenceSettings {
  return {
    id: "",
    title: "",
    description: "",
    abstractDeadline: new Date().toISOString(),
    fullPaperDeadline: new Date().toISOString(),
    reviewDeadline: new Date().toISOString(),
    cameraReadyDeadline: new Date().toISOString(),
    regularFee: 0,
    earlyBirdFee: 0,
    lateFee: 0,
    maxAbstractWords: 300,
    allowedFileTypes: ["pdf", "docx"],
    maxFileSizeMb: 10,
    tracks: [],
  };
}

export function ConferenceEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [settings, setSettings] = React.useState<ConferenceSettings | null>(isNew ? blankConference() : null);
  const [notFound, setNotFound] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (isNew) return;
    api.getConferenceById(id!).then((c) => {
      if (!c) { setNotFound(true); return; }
      setSettings(c);
    });
  }, [id, isNew]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-base text-muted-foreground">Conference not found.</p>
        <Link to="/admin/conference" className="text-base text-primary hover:underline">Back to Manage Conferences</Link>
      </div>
    );
  }

  if (!settings) return <p className="text-base text-muted-foreground">Loading...</p>;

  const update = <K extends keyof ConferenceSettings>(key: K, value: ConferenceSettings[K]) => {
    setSettings({ ...settings, [key]: value });
    setSuccessMsg(null);
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: "" }));
  };

  const addTrack = () => update("tracks", [...settings.tracks, { id: `t-${Date.now()}`, name: "", description: "" } as Track]);
  const updateTrack = (trackId: string, field: keyof Track, value: string) =>
    update("tracks", settings.tracks.map((t) => (t.id === trackId ? { ...t, [field]: value } : t)));
  const removeTrack = (trackId: string) => update("tracks", settings.tracks.filter((t) => t.id !== trackId));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!settings.title.trim()) errs.title = "Conference title is required.";
    if (!settings.abstractDeadline) errs.abstractDeadline = "Abstract deadline is required.";
    if (!settings.fullPaperDeadline) errs.fullPaperDeadline = "Full paper deadline is required.";
    if (settings.tracks.length === 0) errs.tracks = "Add at least one track.";
    if (settings.tracks.some((t) => !t.name.trim())) errs.tracks = "Every track needs a name.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const { id: _discard, ...payload } = settings;
      if (isNew) {
        const created = await api.createConference(payload);
        navigate(`/admin/conference/${created.id}`, { state: { justCreated: true } });
      } else {
        await api.updateConferenceSettings(id!, payload);
        setSuccessMsg("Conference settings saved successfully.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/admin/conference" className="inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Manage Conferences
      </Link>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">{isNew ? "Add Conference" : "Edit Conference"}</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Conference title</Label>
              <Input value={settings.title} onChange={(e) => update("title", e.target.value)} />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={settings.description} onChange={(e) => update("description", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Important Dates</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Abstract deadline</Label>
              <Input type="datetime-local" value={toDateInputValue(settings.abstractDeadline)} onChange={(e) => update("abstractDeadline", new Date(e.target.value).toISOString())} />
              {errors.abstractDeadline && <p className="text-sm text-destructive">{errors.abstractDeadline}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Full paper deadline</Label>
              <Input type="datetime-local" value={toDateInputValue(settings.fullPaperDeadline)} onChange={(e) => update("fullPaperDeadline", new Date(e.target.value).toISOString())} />
              {errors.fullPaperDeadline && <p className="text-sm text-destructive">{errors.fullPaperDeadline}</p>}
            </div>
            <div className="space-y-1.5"><Label>Review deadline</Label><Input type="datetime-local" value={toDateInputValue(settings.reviewDeadline)} onChange={(e) => update("reviewDeadline", new Date(e.target.value).toISOString())} /></div>
            <div className="space-y-1.5"><Label>Camera-ready deadline</Label><Input type="datetime-local" value={toDateInputValue(settings.cameraReadyDeadline)} onChange={(e) => update("cameraReadyDeadline", new Date(e.target.value).toISOString())} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fees (USD)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label>Regular fee</Label><Input type="number" value={settings.regularFee} onChange={(e) => update("regularFee", Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Early bird fee</Label><Input type="number" value={settings.earlyBirdFee ?? 0} onChange={(e) => update("earlyBirdFee", Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Late fee</Label><Input type="number" value={settings.lateFee ?? 0} onChange={(e) => update("lateFee", Number(e.target.value))} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle>Tracks</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTrack}><Plus className="h-4 w-4" /> Add Track</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.tracks.map((t) => (
              <div key={t.id} className="flex items-start gap-2 rounded-md border border-border p-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Input placeholder="Track name" value={t.name} onChange={(e) => updateTrack(t.id, "name", e.target.value)} />
                  <Input placeholder="Short description" value={t.description} onChange={(e) => updateTrack(t.id, "description", e.target.value)} />
                </div>
                <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeTrack(t.id)}><X className="h-4 w-4" /></Button>
              </div>
            ))}
            {errors.tracks && <p className="text-sm text-destructive">{errors.tracks}</p>}
            {settings.tracks.length === 0 && !errors.tracks && (
              <p className="text-sm text-muted-foreground">No tracks yet - add at least one before saving.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Submission Rules</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Max abstract words</Label><Input type="number" value={settings.maxAbstractWords} onChange={(e) => update("maxAbstractWords", Number(e.target.value))} /></div>
            <div className="space-y-1.5"><Label>Max file size (MB)</Label><Input type="number" value={settings.maxFileSizeMb} onChange={(e) => update("maxFileSizeMb", Number(e.target.value))} /></div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {successMsg && <p className="text-base text-success">{successMsg}</p>}
            <div className="ml-auto flex gap-2">
              <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : isNew ? "Create Conference" : "Save Settings"}</Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
