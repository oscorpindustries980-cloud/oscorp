import { useState, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileUp, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePortal, type Department } from "@/lib/portal-store";

export const Route = createFileRoute("/quotations")({
  head: () => ({
    meta: [
      { title: "Submit a Quotation — Oscorp Industries" },
      {
        name: "description",
        content:
          "Upload proposal documents, set your budget and division, and receive an instant Oscorp reference ID for tracking.",
      },
      { property: "og:title", content: "Submit a Quotation — Oscorp Industries" },
      {
        property: "og:description",
        content:
          "Drag-and-drop proposal submission with automatic reference generation and live status tracking.",
      },
    ],
  }),
  component: QuotationsPage,
});

const departments: Department[] = ["Heavy Machinery", "Industrial Automation", "Power & Energy", "HR"];

function QuotationsPage() {
  const { submitQuotation, isBlocked, flagSuspension, user } = usePortal();
  const [client, setClient] = useState(user?.name ?? "");
  const [email, setEmail] = useState("procurement@oscorp.com");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [department, setDepartment] = useState<Department>("Heavy Machinery");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [issuedRef, setIssuedRef] = useState<string | null>(null);

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFileName(f.name);
      toast.success(`${f.name} attached to this submission.`);
    }
  };

  const submit = async () => {
    if (isBlocked) {
      flagSuspension();
      toast.error("Your account has been suspended by Oscorp Admin.");
      return;
    }
    if (!client.trim() || !email.trim() || !title.trim() || !budget || !fileName) {
      toast.error("Complete every field and attach a proposal document before submitting.");
      return;
    }
    const id = await submitQuotation({
      client: client.trim(),
      email: email.trim(),
      title: title.trim(),
      department,
      budget: Number(budget),
      notes: notes.trim(),
      fileName,
    });
    setIssuedRef(id);
    toast.success(`Quotation submitted — Reference ${id}`, {
      description: `A confirmation has been dispatched to ${email.trim()}.`,
    });
    setTitle("");
    setBudget("");
    setNotes("");
    setFileName("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-primary">Client Quotation Submission</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Submit a formal proposal to the Oscorp contracts desk. Accepted formats: PDF, DOCX, ZIP up
        to 50 MB.
      </p>

      {issuedRef && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-accent/35 bg-accent/8 p-4">
          <CheckCircle2 className="size-5 text-accent" />
          <p className="text-sm text-foreground">
            Submission received. Your reference ID is{" "}
            <span className="font-mono font-semibold text-accent">{issuedRef}</span> — track it from
            the home page status tracker.
          </p>
        </div>
      )}

      <Card className="mt-8 glass-card">
        <CardHeader>
          <CardTitle className="text-base">Proposal details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 px-6 py-10 text-center transition-colors",
              dragging && "border-accent bg-accent/8",
            )}
          >
            <FileUp className="size-7 text-accent" />
            <p className="mt-3 text-sm font-medium text-primary">
              Drag & drop your proposal here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX or ZIP · max 50 MB</p>
            <input
              type="file"
              accept=".pdf,.docx,.zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFileName(f.name);
                  toast.success(`${f.name} attached to this submission.`);
                }
              }}
            />
            {fileName && (
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background px-3 py-1 text-xs font-medium text-accent">
                <Paperclip className="size-3" /> {fileName}
              </span>
            )}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="client">Client / company name</Label>
              <Input id="client" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Target contact email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Project title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Estimated budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="250000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={department} onValueChange={(v) => setDepartment(v as Department)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Detailed work notes</Label>
            <Textarea
              id="notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Scope, milestones, compliance requirements…"
            />
          </div>

          <Button size="lg" onClick={submit}>
            <Send className="size-4" /> Submit quotation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
