import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Factory,
  Cog,
  Zap,
  FileSpreadsheet,
  Search,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

import industrialHero from "@/assets/industrial-hero.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { currency, trackingStage, usePortal, type Quotation } from "@/lib/portal-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oscorp Industries — Advanced Enterprise Quotation & Contract Portal" },
      { name: "description", content: "Track quotations, submit proposals and verify Oscorp personnel in one governed enterprise portal for heavy machinery, automation and power contracting." },
      {
        property: "og:title",
        content: "Oscorp Industries — Advanced Enterprise Quotation & Contract Portal",
      },
      { property: "og:description", content: "Track quotations, submit proposals and verify Oscorp personnel in one governed enterprise portal for heavy machinery, automation and power contracting." },
    ],
  }),
  component: Home,
});

const divisions = [
  {
    icon: Factory,
    name: "Heavy Machinery",
    blurb: "CNC fabrication, press lines, plant build-outs and heavy equipment contracting.",
    metric: "184 active contracts",
  },
  {
    icon: Cog,
    name: "Industrial Automation",
    blurb: "PLC and SCADA systems, conveyor retrofits and Mark-IV control panel integration.",
    metric: "97 active contracts",
  },
  {
    icon: Zap,
    name: "Power & Energy",
    blurb: "Turbine overhauls, boiler integration and industrial power distribution programs.",
    metric: "41 active contracts",
  },
  {
    icon: FileSpreadsheet,
    name: "Quotation Management",
    blurb: "Centralised pricing, approvals and contract dispatch across every division.",
    metric: "1,240 quotations YTD",
  },
];

function Home() {
  const { quotations } = usePortal();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Quotation | null | undefined>(undefined);

  const track = () => {
    if (!query.trim()) {
      toast.error("Enter a reference ID, e.g. OSC-QT-90821.");
      return;
    }
    const found = quotations.find((q) => q.id.toLowerCase() === query.trim().toLowerCase());
    setResult(found ?? null);
    if (found) toast.success(`Reference ${found.id} located — status: ${found.status}.`);
    else toast.error("No quotation found for that reference ID.");
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-background">
        <img
          src={industrialHero}
          alt="Oscorp Industries heavy machinery assembly hall at dusk"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-[0.18]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />
        <div className="absolute inset-0 grid-backdrop" />
        <div className="absolute -right-40 -top-40 size-[32rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/8 px-3 py-1 text-xs font-medium text-accent">
            <Activity className="size-3.5" /> Portal status: All systems operational
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.08] text-primary sm:text-5xl lg:text-6xl">
            Oscorp Industries —{" "}
            <span className="emerald-text">Advanced Enterprise Quotation & Contract Portal</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A single governed workspace for vendor onboarding, quotation submission, approval
            workflows and verified document dispatch across every Oscorp division.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/quotations">
                Submit a quotation <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/directory">
                <ShieldCheck className="size-4" /> Verify personnel
              </Link>
            </Button>
          </div>

          <Card className="mt-12 max-w-3xl glass-card">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-primary">Live Quotation Status Tracker</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && track()}
                    placeholder="Enter Reference ID, e.g. OSC-QT-90821"
                    className="h-11 pl-9 font-mono"
                  />
                </div>
                <Button className="h-11" onClick={track}>
                  Track progress
                </Button>
              </div>

              {result === null && (
                <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  No record matches that reference. Check the ID printed on your acknowledgement
                  email.
                </p>
              )}
              {result && (
                <div className="mt-4 rounded-lg border border-border bg-secondary/60 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-primary">{result.id}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/8 px-2.5 py-1 text-[11px] font-medium text-accent">
                      {trackingStage(result.status).label}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Filed {result.date}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{result.title}</p>
                  <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                    <span>Client: {result.client}</span>
                    <span>Division: {result.department}</span>
                    <span>
                      Value:{" "}
                      {currency(result.budget)} (requested)
                    </span>
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold text-primary sm:text-3xl">Corporate Divisions</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Each division operates its own procurement desk with dedicated compliance review and
          contract dispatch service levels.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {divisions.map((d) => (
            <Card
              key={d.name}
              className="group glass-card transition-all hover:-translate-y-1 hover:border-accent/40"
            >
              <CardContent className="p-6">
                <span className="grid size-11 place-items-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-accent/15 group-hover:text-accent">
                  <d.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-primary">{d.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.blurb}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-accent">
                  {d.metric}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-6 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-6">
          <span className="text-primary">Accreditations</span>
          {[
            "ISO 9001:2015",
            "ISO 45001",
            "ASME U-Stamp",
            "IEC 61511 (SIS)",
            "SOC 2 Type II",
            "NYSE: OSCP",
          ].map((c) => (
            <span key={c} className="rounded border border-border bg-background px-2.5 py-1">
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-primary sm:text-3xl">
              Latest procurement notices
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Live feed from the central contracts desk. Reference IDs are traceable in the tracker
              above.
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/8 px-3 py-1 text-xs font-medium text-accent">
            <Activity className="size-3.5" /> Updated {new Date().toISOString().slice(0, 10)}
          </span>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Division</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Filed</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...quotations]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map((q) => (
                  <tr key={q.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{q.id}</td>
                    <td className="px-4 py-3 text-foreground">{q.title}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {q.department}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {q.date}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[

            ["1,240", "Quotations processed YTD"],
            ["98.4%", "Contract dispatch accuracy"],
            ["3.2 days", "Median approval turnaround"],
            ["62", "Verified partner nations"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-semibold text-primary">{v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
