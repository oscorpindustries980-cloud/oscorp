import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle2,
  FileStack,
  Hourglass,
  Bell,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
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
import { Switch } from "@/components/ui/switch";
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
import { StatusBadge } from "@/components/status-badge";
import { AuthDialog } from "@/components/auth-dialog";
import {
  currency,
  usePortal,
  type Department,
  type Employee,
  type Quotation,
} from "@/lib/portal-store";

const divisions: Department[] = [
  "Heavy Machinery",
  "Industrial Automation",
  "Power & Energy",
  "HR",
];

const dispatchStates: Employee["dispatch"][] = ["Dispatched", "Queued", "Awaiting Signature"];

export const Route = createFileRoute("/hr")({
  head: () => ({
    meta: [
      { title: "HR Panel — Oscorp Industries Corporation" },
      {
        name: "description",
        content:
          "Oscorp human resources console for personnel verification, document dispatch tracking and quotation approvals.",
      },
      { property: "og:title", content: "HR Panel — Oscorp Industries Corporation" },
      {
        property: "og:description",
        content:
          "Verify personnel records, update dispatch status and clear quotations lodged by Oscorp staff.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HRPage,
});

function HRPage() {
  const { isHR, isAdmin } = usePortal();
  const [authOpen, setAuthOpen] = useState(false);

  if (!isHR && !isAdmin) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-xl forest-panel">
          <ShieldAlert className="size-6 text-emerald-glow" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold text-primary">Restricted — HR Desk Only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with Oscorp human resources credentials to open the HR Panel.
        </p>
        <Button className="mt-6" onClick={() => setAuthOpen(true)}>
          <ShieldCheck className="size-4" /> HR sign in
        </Button>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  return <HRConsole />;
}

function HRConsole() {
  const {
    user,
    employees,
    quotations,
    notifications,
    unreadHRNotifications,
    markNotificationRead,
    markAllHRNotificationsRead,
    approveQuotation,
    rejectQuotation,
    setQuotationStatus,
    setEmployeeVerified,
    setEmployeeDispatch,
  } = usePortal();

  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("all");
  const [approving, setApproving] = useState<Quotation | null>(null);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  const personnel = useMemo(
    () =>
      employees.filter((e) => {
        const matchesDivision = division === "all" || e.division === division;
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.ref.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q);
        return matchesDivision && matchesSearch;
      }),
    [employees, division, search],
  );

  const pending = quotations.filter((q) => q.status === "Submitted" || q.status === "Under Review");
  const approved = quotations.filter((q) => q.status === "Approved");

  const stats = [
    { label: "Personnel on roll", value: employees.length, icon: Users },
    { label: "Verified records", value: employees.filter((e) => e.verified).length, icon: BadgeCheck },
    { label: "Quotations pending", value: pending.length, icon: Hourglass },
    { label: "Cleared this cycle", value: approved.length, icon: CheckCircle2 },
  ];

  const confirmApproval = async () => {
    if (!approving) return;
    const value = Number(price);
    if (!value || value <= 0) {
      toast.error("Enter a valid sanctioned contract value.");
      return;
    }
    await approveQuotation(approving.id, value, notes.trim());
    toast.success(`${approving.id} approved at ${currency(value)}.`);
    setApproving(null);
    setPrice("");
    setNotes("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Human Resources Directorate
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-primary">HR Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {user?.name ?? "HR Desk"} · Personnel records, verification badges and
            quotation clearance.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="flex items-center gap-3 p-5">
              <span className="grid size-10 place-items-center rounded-lg forest-panel">
                <s.icon className="size-5 text-emerald-glow" />
              </span>
              <div>
                <p className="text-2xl font-semibold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 glass-card">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4 text-emerald-glow" />
            HR Notifications
            {unreadHRNotifications > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                {unreadHRNotifications} new
              </span>
            )}
          </CardTitle>
          {unreadHRNotifications > 0 && (
            <Button size="sm" variant="outline" onClick={markAllHRNotificationsRead}>
              Mark all read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quotation notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 8).map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-secondary/70 ${
                    notification.read ? "border-border bg-secondary/30" : "border-accent/40 bg-accent/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Bell className="mt-0.5 size-4 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{notification.message}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="ml-auto mt-1 size-2 shrink-0 rounded-full bg-accent" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="personnel" className="mt-8">
        <TabsList>
          <TabsTrigger value="personnel">Personnel Directory</TabsTrigger>
          <TabsTrigger value="quotations">Quotation Clearance</TabsTrigger>
        </TabsList>

        <TabsContent value="personnel" className="mt-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Personnel records</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, reference ID or email"
                    className="w-64 pl-8"
                  />
                </div>
                <Select value={division} onValueChange={setDivision}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="All divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All divisions</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Document dispatch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personnel.map((e) => (
                    <TableRow key={e.ref}>
                      <TableCell className="font-mono text-xs">{e.ref}</TableCell>
                      <TableCell>
                        <span className="block font-medium text-foreground">{e.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {e.title} · {e.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{e.division}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={e.verified}
                            onCheckedChange={(v) => {
                              setEmployeeVerified(e.ref, v);
                              toast.success(
                                `${e.name} marked ${v ? "verified" : "unverified"}.`,
                              );
                            }}
                            aria-label={`Toggle verification for ${e.name}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {e.verified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={e.dispatch}
                          onValueChange={(v) => {
                            setEmployeeDispatch(e.ref, v as Employee["dispatch"]);
                            toast.success(`${e.name}: dispatch set to ${v}.`);
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {dispatchStates.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {personnel.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No personnel records match this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileStack className="size-4 text-emerald-glow" /> Quotations lodged by personnel
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Lodged by</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Estimate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs">{q.id}</TableCell>
                      <TableCell>
                        <span className="block text-sm font-medium text-foreground">{q.client}</span>
                        <span className="block text-xs text-muted-foreground">
                          {q.ownerRef ?? q.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-[22rem] truncate text-sm">{q.title}</span>
                        <span className="block text-xs text-muted-foreground">{q.department}</span>
                      </TableCell>
                      <TableCell className="text-sm">{currency(q.budget)}</TableCell>
                      <TableCell>
                        <StatusBadge status={q.status} />
                        {q.status === "Approved" && q.approvedPrice ? (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Sanctioned {currency(q.approvedPrice)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {q.status === "Submitted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                void setQuotationStatus(q.id, "Under Review");
                                toast.info(`${q.id} moved to review.`);
                              }}
                            >
                              <Hourglass className="size-4" /> Review
                            </Button>
                          )}
                          <Button
                            size="sm"
                            disabled={q.status === "Approved"}
                            onClick={() => {
                              setApproving(q);
                              setPrice(String(q.budget));
                              setNotes("");
                            }}
                          >
                            <CheckCircle2 className="size-4" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={q.status === "Rejected"}
                            onClick={() => {
                              void rejectQuotation(q.id, "Rejected by HR directorate.");
                              toast.error(`${q.id} rejected.`);
                            }}
                          >
                            <XCircle className="size-4" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!approving} onOpenChange={(o) => !o && setApproving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {approving?.id}</DialogTitle>
            <DialogDescription>
              Record the sanctioned contract value and HR remarks. The lodging personnel sees this
              decision on their upload desk.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hr-price">Sanctioned contract value (USD)</Label>
              <Input
                id="hr-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hr-notes">HR remarks</Label>
              <Textarea
                id="hr-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Clearance conditions, delivery window, sign-off authority…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproving(null)}>
              Cancel
            </Button>
            <Button onClick={confirmApproval}>Confirm approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
