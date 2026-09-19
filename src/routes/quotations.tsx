import { useRef, useState, type DragEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileUp, Paperclip, Send, X } from "lucide-react";
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
      {
        property: "og:title",
        content: "Submit a Quotation — Oscorp Industries",
      },
      {
        property: "og:description",
        content:
          "Drag-and-drop proposal submission with automatic reference generation and live status tracking.",
      },
    ],
  }),
  component: QuotationsPage,
});

const departments: Department[] = [
  "Heavy Machinery",
  "Industrial Automation",
  "Power & Energy",
  "HR",
];

function QuotationsPage() {
  const { submitQuotation, isBlocked, flagSuspension, user } = usePortal();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [client, setClient] = useState(user?.name ?? "");
  const [email, setEmail] = useState("procurement@oscorp.com");
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [department, setDepartment] =
    useState<Department>("Heavy Machinery");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [issuedRef, setIssuedRef] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "application/x-zip-compressed",
    ];

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "docx", "zip"].includes(extension ?? "")) {
      toast.error("Only PDF, DOCX or ZIP files are allowed.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 50 MB.");
      return;
    }

    if (file.type && !allowedTypes.includes(file.type)) {
      toast.error("Please select a PDF, DOCX or ZIP file.");
      return;
    }

    setFileName(file.name);
    toast.success(`${file.name} attached to this submission.`);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    // Allows selecting the same file again after removing it
    e.target.value = "";
  };

  const removeFile = () => {
    setFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submit = async () => {
    if (isBlocked) {
      flagSuspension();
      toast.error("Your account has been suspended by Oscorp Admin.");
      return;
    }

    if (
      !client.trim() ||
      !email.trim() ||
      !title.trim() ||
      !budget ||
      !fileName
    ) {
      toast.error(
        "Complete every field and attach a proposal document before submitting.",
      );
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
      <h1 className="text-3xl font-semibold text-primary">
        Client Quotation Submission
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Submit a formal proposal to the Oscorp contracts desk. Accepted
        formats: PDF, DOCX, ZIP up to 50 MB.
      </p>

      {issuedRef && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-accent/35 bg-accent/8 p-4">
          <CheckCircle2 className="size-5 text-accent" />

          <p className="text-sm text-foreground">
            Submission received. Your reference ID is{" "}
            <span className="font-mono font-semibold text-accent">
              {issuedRef}
            </span>{" "}
            — track it from the home page status tracker.
          </p>
        </div>
      )}

      <Card className="mt-8 glass-card">
        <CardHeader>
          <CardTitle className="text-base">Proposal details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* FILE UPLOAD */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(false);
            }}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 px-6 py-10 text-center transition-all",
              "hover:border-accent hover:bg-accent/5",
              dragging && "border-accent bg-accent/10 scale-[1.01]",
            )}
          >
            <FileUp className="size-8 text-accent" />

            <p className="mt-3 text-sm font-medium text-primary">
              Drag & drop your proposal here, or click to browse
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX or ZIP · max 50 MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.zip,application/pdf,application/zip,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={onFileChange}
            />

            {fileName && (
              <div
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background px-3 py-1.5 text-xs font-medium text-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <Paperclip className="size-3" />

                <span className="max-w-[300px] truncate">
                  {fileName}
                </span>

                <button
                  type="button"
                  onClick={removeFile}
                  className="ml-1 rounded-full p-0.5 hover:bg-accent/10"
                  aria-label="Remove file"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="client">Client / company name</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Target contact email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Project title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
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

              <Select
                value={department}
                onValueChange={(v) => setDepartment(v as Department)}
              >
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
            <Send className="size-4" />
            Submit quotation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
