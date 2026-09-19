import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  FileStack,
  Hourglass,
  Lock,
  LockOpen,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountBadge, StatusBadge } from "@/components/status-badge";
import { AuthDialog } from "@/components/auth-dialog";
import { currency, usePortal, type Department, type Quotation } from "@/lib/portal-store";

const divisions: Department[] = [
  "Heavy Machinery",
  "Industrial Automation",
  "Power & Energy",
  "HR",
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Panel — Oscorp Industries" },
      {
        name: "description",
        content:
          "Oscorp administrator console for quotation approvals, contract pricing and vendor account control.",
      },
      { property: "og:title", content: "Admin Control Panel — Oscorp Industries" },
      {
        property: "og:description",
        content: "Approve quotations, set final contract pricing and manage vendor account access.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin } = usePortal();
  const [authOpen, setAuthOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-xl forest-panel">
          <ShieldAlert className="size-6 text-emerald-glow" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-primary">Restricted — Admin Only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with Oscorp administrator credentials to open the Control Panel.
        </p>
        <Button className="mt-6" onClick={() => setAuthOpen(true)}>
          <ShieldCheck className="size-4" /> Admin sign in
        </Button>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return <AdminConsole />;
}

function AdminConsole() {
  const {
    quotations,
    users,
    employees,
    addEmployee,
    approveQuotation,
    rejectQuotation,
    setQuotationStatus,
    blockUser,
    unblockUser,
  } = usePortal();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [approving, setApproving] = useState<Quotation | null>(null);
  const [price, setPrice] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [blocking, setBlocking] = useState<string | null>(null);
  const [reason, setReason] = useState("Policy Violation");
  const emptyHire = {
    name: "",
    title: "",
    email: "",
    grade: "",
    location: "",
    division: "Heavy Machinery" as Department,
    verified: true,
  };
  const [hire, setHire] = useState(emptyHire);

  const stats = [
    {
      label: "Total Quotations",
      value: quotations.length,
      icon: FileStack,
    },
    {
      label: "Pending Review",
      value: quotations.filter((q) => q.status === "Submitted" || q.status === "Under Review")
        .length,
      icon: Hourglass,
    },
    {
      label: "Approved Contracts",
      value: quotations.filter((q) => q.status === "Approved").length,
      icon: CheckCircle2,
    },
    {
      label: "Blocked Users",
      value: users.filter((u) => u.status === "Blocked").length,
      icon: Lock,
    },
  ];

  const filtered = quotations.filter(
    (q) =>
      (filter === "all" || q.status === filter) &&
      `${q.id} ${q.client} ${q.email} ${q.title} ${q.ownerRef ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );


  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Admin Control Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approval engine, contract pricing and vendor killswitch.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid size-11 place-items-center rounded-lg bg-accent/12 text-accent">
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold text-primary">{s.value}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="quotations" className="mt-10">
        <TabsList>
          <TabsTrigger value="quotations">Quotation Approvals</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="hr">HR Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="quotations" className="pt-5">
          <Card className="glass-card">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CardTitle className="text-base">All submitted quotations</CardTitle>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
                <div className="relative sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ref, client, email…"
                    className="pl-9"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs font-medium text-primary">
                        {q.id}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{q.client}</span>
                        <span className="block text-xs text-muted-foreground">
                          {q.department}
                          {q.ownerRef && (
                            <span className="ml-1 font-mono text-accent">· {q.ownerRef}</span>
                          )}
                        </span>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {q.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {currency(q.approvedPrice ?? q.budget)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {q.date}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={q.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {q.status !== "Approved" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setApproving(q);
                                setPrice(String(q.budget));
                                setAdminNotes("");
                              }}
                            >
                              <CheckCircle2 className="size-3.5" /> Approve
                            </Button>
                          )}
                          {q.status === "Submitted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setQuotationStatus(q.id, "Under Review");
                                toast.info(`${q.id} moved to Under Review.`);
                              }}
                            >
                              Review
                            </Button>
                          )}
                          {q.status !== "Rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => {
                                rejectQuotation(q.id, "Rejected by Oscorp contracts desk.");
                                toast.error(`${q.id} has been rejected.`);
                              }}
                            >
                              <XCircle className="size-3.5" /> Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toast.success(`Downloading ${q.fileName}…`, {
                                description: `Secure link dispatched to ${q.email}.`,
                              })
                            }
                          >
                            <Download className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        No quotations match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="pt-5">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Registered accounts & killswitch</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell className="text-sm">{u.role}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {u.joined}
                      </TableCell>
                      <TableCell>
                        <AccountBadge status={u.status} />
                        {u.blockReason && (
                          <span className="block text-[11px] text-muted-foreground">
                            {u.blockReason}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.role === "Admin" ? (
                          <span className="text-xs text-muted-foreground">Protected</span>
                        ) : u.status === "Active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => {
                              setBlocking(u.id);
                              setReason("Policy Violation");
                            }}
                          >
                            <Lock className="size-3.5" /> Block user
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              unblockUser(u.id);
                              toast.success(`${u.name} has been restored to Active.`);
                            }}
                          >
                            <LockOpen className="size-3.5" /> Unblock
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hr" className="pt-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Add personnel to HR directory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hr-name">Full name</Label>
                  <Input
                    id="hr-name"
                    value={hire.name}
                    onChange={(e) => setHire({ ...hire, name: e.target.value })}
                    placeholder="Ritika Sharma"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hr-title">Designation</Label>
                  <Input
                    id="hr-title"
                    value={hire.title}
                    onChange={(e) => setHire({ ...hire, title: e.target.value })}
                    placeholder="Procurement Analyst"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hr-email">Work email</Label>
                  <Input
                    id="hr-email"
                    type="email"
                    value={hire.email}
                    onChange={(e) => setHire({ ...hire, email: e.target.value })}
                    placeholder="r.sharma@oscorp.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Division</Label>
                  <Select
                    value={hire.division}
                    onValueChange={(v) => setHire({ ...hire, division: v as Department })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="hr-grade">Grade</Label>
                    <Input
                      id="hr-grade"
                      value={hire.grade}
                      onChange={(e) => setHire({ ...hire, grade: e.target.value })}
                      placeholder="G-7 · Procurement"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hr-loc">Posting</Label>
                    <Input
                      id="hr-loc"
                      value={hire.location}
                      onChange={(e) => setHire({ ...hire, location: e.target.value })}
                      placeholder="Corporate HQ, NY"
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!hire.name.trim() || !hire.title.trim() || !hire.email.trim()) {
                      toast.error("Name, designation and work email are required.");
                      return;
                    }
                    const res = addEmployee({
                      ...hire,
                      grade: hire.grade.trim() || `G-6 · ${hire.division}`,
                      location: hire.location.trim() || "Corporate HQ, NY",
                    });
                    if (!res.ok) {
                      toast.error(res.message);
                      return;
                    }
                    toast.success(`${hire.name} onboarded — ${res.ref}`, {
                      description: `Personnel passcode issued: ${res.passcode}`,
                    });
                    setHire(emptyHire);
                  }}
                >
                  <UserPlus className="size-4" /> Onboard personnel
                </Button>
                <p className="text-xs text-muted-foreground">
                  A reference ID and passcode are issued automatically. The new record appears in
                  the public verification hub and can sign in to the personnel desk immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">
                  Personnel records ({employees.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Designation</TableHead>
                      <TableHead className="hidden lg:table-cell">Division</TableHead>
                      <TableHead>Verification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((e) => (
                      <TableRow key={e.ref}>
                        <TableCell className="font-mono text-xs font-medium text-primary">
                          {e.ref}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{e.name}</span>
                          <span className="block text-xs text-muted-foreground">{e.email}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {e.title}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {e.division}
                        </TableCell>
                        <TableCell className="text-xs">
                          {e.verified ? (
                            <span className="text-accent">Verified</span>
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approve modal */}
      <Dialog open={!!approving} onOpenChange={(v) => !v && setApproving(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve quotation {approving?.id}</DialogTitle>
            <DialogDescription>
              Set the final approved contract price and record an internal note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Final approved price (USD)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="anotes">Admin notes</Label>
              <Textarea
                id="anotes"
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Conditions, value engineering, dispatch instructions…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproving(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!approving) return;
                if (!price || Number(price) <= 0) {
                  toast.error("Enter a valid approved price.");
                  return;
                }
                approveQuotation(approving.id, Number(price), adminNotes.trim());
                toast.success(`${approving.id} approved at ${currency(Number(price))}`, {
                  description: `Contract dispatched to ${approving.email}.`,
                });
                setApproving(null);
              }}
            >
              Confirm approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block modal */}
      <Dialog open={!!blocking} onOpenChange={(v) => !v && setBlocking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block account</DialogTitle>
            <DialogDescription>
              A reason is mandatory and is shown to the user in their suspension banner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Reason for suspension</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Policy Violation">Policy Violation</SelectItem>
                <SelectItem value="Unverified Documents">Unverified Documents</SelectItem>
                <SelectItem value="Payment Dispute">Payment Dispute</SelectItem>
                <SelectItem value="Suspected Fraud">Suspected Fraud</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlocking(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!blocking) return;
                const target = users.find((u) => u.id === blocking);
                blockUser(blocking, reason);
                toast.error(`${target?.name ?? "User"} has been blocked — ${reason}.`);
                setBlocking(null);
              }}
            >
              <Lock className="size-4" /> Block user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
