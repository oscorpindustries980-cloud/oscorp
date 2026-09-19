import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  FileUp,
  FolderKanban,
  IdCard,
  Lock,
  Paperclip,
  Send,
  Upload,
  X,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/auth-dialog";
import {
  currency,
  trackingStage,
  usePortal,
  type Department,
} from "@/lib/portal-store";

export const Route = createFileRoute("/employee")({
  head: () => ({
    meta: [
      { title: "Employee Quotation Upload Desk — Oscorp Industries" },
      {
        name: "description",
        content:
          "Internal desk for Oscorp personnel to upload vendor quotations and supporting documents to the contracts registry.",
      },
      {
        property: "og:title",
        content: "Employee Quotation Upload Desk — Oscorp Industries",
      },
      {
        property: "og:description",
        content:
          "Upload quotation files against your employee reference ID and receive an internal lodgement receipt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmployeeUploadPage,
});

const departments: Department[] = [
  "Heavy Machinery",
  "Industrial Automation",
  "Power & Energy",
  "HR",
];

function EmployeeUploadPage() {
  const { employee } = usePortal();
  const [authOpen, setAuthOpen] = useState(false);

  if (!employee) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-xl forest-panel">
          <Lock className="size-6 text-emerald-glow" />
        </span>

        <h1 className="mt-6 text-2xl font-semibold text-primary">
          Personnel sign-in required
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your Oscorp personnel reference ID to open your upload
          desk. Your name, grade, division and posting are loaded automatically
          from the HR record.
        </p>

        <Button className="mt-6" onClick={() => setAuthOpen(true)}>
          <IdCard className="size-4" />
          Sign in with reference ID
        </Button>

        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return <EmployeeDesk />;
}

function EmployeeDesk() {
  const {
    submitQuotation,
    isBlocked,
    flagSuspension,
    employee,
    logout,
    quotations,
  } = usePortal();

  const emp = employee!;
  const ref = emp.ref;
  const name = emp.name;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [division, setDivision] = useState<Department>(emp.division);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [receipts, setReceipts] = useState<
    { id: string; file: string; at: string }[]
  >([]);

  const myProjects = quotations.filter((q) => q.ownerRef === emp.ref);

  const attach = (file: File | undefined) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "docx", "zip"].includes(extension ?? "")) {
      toast.error("Only PDF, DOCX or ZIP files are allowed.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large. Maximum allowed size is 50 MB.");
      return;
    }

    setFileName(file.name);

    toast.success(`${file.name} attached for lodgement.`);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      attach(file);
    }

    // Allows the same file to be selected again later.
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      attach(file);
    }
  };

  const removeFile = () => {
    setFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success("File removed.");
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const submit = async () => {
    if (isBlocked) {
      flagSuspension();
      toast.error("Your account has been suspended by Oscorp Admin.");
      return;
    }

    if (!title.trim() || !fileName) {
      toast.error("Enter a document title and attach a file.");
      return;
    }

    const id = await submitQuotation({
      client: name,
      email: emp.email,
      title: title.trim(),
      department: division,
      budget: Number(value) || 0,
      notes: notes.trim(),
      fileName,
      ownerRef: emp.ref,
    });

    setReceipts((prev) => [
      {
        id,
        file: fileName,
        at: new Date().toLocaleString("en-GB"),
      },
      ...prev,
    ]);

    toast.success(`Document lodged — receipt ${id}`, {
      description:
        "Forwarded to the contracts desk for internal processing.",
    });

    setTitle("");
    setValue("");
    setNotes("");
    setFileName("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/8 px-3 py-1 text-xs font-medium text-accent">
        <IdCard className="size-3.5" />
        Internal personnel desk
      </div>

      <h1 className="mt-4 text-3xl font-semibold text-primary">
        Employee Quotation Upload Desk
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Lodge vendor quotations and supporting documents against your Oscorp
        personnel reference. Uploads are routed to the HR contracts desk for
        internal review. Your desk only shows the processing stage; HR approval
        or rejection decisions are kept internal.
      </p>

      <Card className="mt-8 glass-card">
        <CardContent className="flex flex-wrap items-center gap-5 p-5">
          <span className="grid size-14 place-items-center rounded-xl forest-panel font-display text-lg font-semibold text-emerald-glow">
            {emp.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>

          <div className="min-w-40">
            <p className="flex items-center gap-1.5 font-display text-lg font-semibold text-primary">
              {emp.name}
              {emp.verified && (
                <BadgeCheck className="size-4 text-accent" />
              )}
            </p>

            <p className="text-sm text-muted-foreground">{emp.title}</p>
          </div>

          <dl className="grid flex-1 gap-x-8 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Reference ID", emp.ref],
              ["Division", emp.division],
              ["Grade", emp.grade],
              ["Posting", emp.location],
              ["Work email", emp.email],
              ["Joined", emp.joined],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="uppercase tracking-wide text-muted-foreground">
                  {k}
                </dt>
                <dd className="font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6 glass-card">
        <CardHeader>
          <CardTitle className="text-base">
            Document lodgement
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Employee reference ID</Label>

              <Input
                value={ref}
                readOnly
                className="font-mono bg-secondary/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Full name</Label>

              <Input
                value={name}
                readOnly
                className="bg-secondary/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Division</Label>

              <Select
                value={division}
                onValueChange={(v) =>
                  setDivision(v as Department)
                }
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

            <div className="space-y-1.5">
              <Label htmlFor="emp-value">
                Quoted value (USD, optional)
              </Label>

              <Input
                id="emp-value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="185000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emp-title">
              Document title
            </Label>

            <Input
              id="emp-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vendor quotation — hydraulic press spares"
            />
          </div>

          {/* FILE UPLOAD AREA */}
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
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
              dragging &&
                "border-accent bg-accent/10 scale-[1.01]",
            )}
          >
            <FileUp className="size-7 text-accent" />

            <p className="mt-3 text-sm font-medium text-primary">
              Drag & drop the quotation file, or click to browse
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              PDF, DOCX or ZIP · max 50 MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.zip"
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

          <div className="space-y-1.5">
            <Label htmlFor="emp-notes">
              Handover notes
            </Label>

            <Textarea
              id="emp-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Plant, cost centre, vendor name, urgency…"
            />
          </div>

          <Button size="lg" onClick={submit}>
            <Send className="size-4" />
            Lodge document
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6 glass-card">
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-base">
            My project files ({myProjects.length})
          </CardTitle>

          <p className="text-xs text-muted-foreground">
            Every file registered against {emp.ref} with its current internal
            processing stage.
          </p>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {myProjects.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderKanban className="size-4" />
              No project files registered against your reference yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Division
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Value
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Lodged
                  </TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {myProjects.map((q) => {
                  const stage = trackingStage(q.status);

                  return (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs font-medium text-primary">
                        {q.id}
                      </TableCell>

                      <TableCell className="max-w-64">
                        <span className="font-medium">
                          {q.title}
                        </span>

                        <span className="block text-xs text-muted-foreground">
                          {q.fileName}
                        </span>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {q.department}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell whitespace-nowrap text-sm">
                        {q.budget
                          ? currency(q.budget)
                          : "—"}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {q.date}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/8 px-2.5 py-1 text-[11px] font-medium text-accent">
                          <span className="font-mono">
                            {stage.step}/3
                          </span>{" "}
                          {stage.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 glass-card">
        <CardHeader>
          <CardTitle className="text-base">
            Lodgement receipts (this session)
          </CardTitle>
        </CardHeader>

        <CardContent>
          {receipts.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="size-4" />
              No documents lodged yet in this session.
            </p>
          ) : (
            <ul className="space-y-3">
              {receipts.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-secondary/60 p-3"
                >
                  <BadgeCheck className="size-4 text-accent" />

                  <span className="font-mono text-sm font-semibold text-primary">
                    {r.id}
                  </span>

                  <span className="text-sm text-foreground">
                    {r.file}
                  </span>

                  <span className="ml-auto text-xs text-muted-foreground">
                    Lodged {r.at}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            The formal decision letter is also dispatched to your division
            inbox by the procurement office.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
