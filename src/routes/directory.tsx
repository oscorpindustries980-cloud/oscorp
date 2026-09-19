import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Search, Send, Clock, PenLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePortal } from "@/lib/portal-store";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Employee Verification Directory — Oscorp Industries" },
      {
        name: "description",
        content:
          "Verify Oscorp personnel by reference ID and review official verification badges and document dispatch status.",
      },
      { property: "og:title", content: "Employee Verification Directory — Oscorp Industries" },
      {
        property: "og:description",
        content: "Public verification hub for Oscorp Industries personnel and document dispatch.",
      },
    ],
  }),
  component: DirectoryPage,
});

const dispatchIcon = {
  Dispatched: Send,
  Queued: Clock,
  "Awaiting Signature": PenLine,
} as const;

function DirectoryPage() {
  const { employees } = usePortal();
  const [q, setQ] = useState("");
  const [division, setDivision] = useState("all");

  const filtered = employees.filter((e) => {
    const text = `${e.name} ${e.ref} ${e.title}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (division === "all" || e.division === division);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold text-primary">Employee & HR Verification Hub</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Confirm that a representative genuinely works for Oscorp Industries. Search by name or
        reference ID, e.g. OSC-IN-90822.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search personnel or reference ID…"
            className="h-11 pl-9"
          />
        </div>
        <Select value={division} onValueChange={setDivision}>
          <SelectTrigger className="h-11 sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All divisions</SelectItem>
            <SelectItem value="Heavy Machinery">Heavy Machinery</SelectItem>
            <SelectItem value="Industrial Automation">Industrial Automation</SelectItem>
            <SelectItem value="Power & Energy">Power &amp; Energy</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => {
          const Icon = dispatchIcon[e.dispatch];
          return (
            <Card key={e.ref} className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full forest-panel font-display text-sm font-semibold">
                    {e.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">{e.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{e.title}</p>
                    <p className="mt-1 font-mono text-xs text-accent">{e.ref}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      e.verified
                        ? "border-accent/35 bg-accent/10 text-accent"
                        : "border-warning/40 bg-warning/15 text-warning-foreground"
                    }
                  >
                    <BadgeCheck className="mr-1 size-3" />
                    {e.verified ? "Officially Verified" : "Verification Pending"}
                  </Badge>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    <Icon className="mr-1 size-3" /> {e.dispatch}
                  </Badge>
                  <Badge variant="secondary">{e.division}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No personnel match that search.</p>
        )}
      </div>
    </div>
  );
}
