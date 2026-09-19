import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Hexagon, LogOut, Menu, ShieldCheck, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { AuthDialog } from "@/components/auth-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePortal } from "@/lib/portal-store";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Overview" },
  { to: "/quotations", label: "Submit Quotation" },
  { to: "/employee", label: "Employee Upload" },
  { to: "/directory", label: "Employee Directory" },
  { to: "/hr", label: "HR Panel" },
  { to: "/admin", label: "Admin Portal" },
] as const;

export function SiteHeader() {
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, isHR, logout, employee } = usePortal();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative grid size-9 place-items-center rounded-lg forest-panel">
            <Hexagon className="size-5 text-emerald-glow" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight text-primary">
              OSCORP INDUSTRIES
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Corporation
            </span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary",
                pathname === l.to && "bg-secondary text-primary",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <Badge variant="outline" className="hidden border-accent/40 bg-accent/10 text-accent sm:inline-flex">
              <ShieldCheck className="mr-1 size-3" /> Admin session
            </Badge>
          )}
          {isHR && (
            <Badge variant="outline" className="hidden border-accent/40 bg-accent/10 text-accent sm:inline-flex">
              <ShieldCheck className="mr-1 size-3" /> HR session
            </Badge>
          )}
          {!user && employee && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserCircle2 className="size-4" />
                  <span className="hidden sm:inline">{employee.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {employee.ref}
                  <span className="mt-1 block font-medium text-foreground">
                    {employee.name} · {employee.title}
                  </span>
                  <span className="block">{employee.division}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/employee">My upload desk</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    toast.success("Personnel session ended.");
                  }}
                >
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserCircle2 className="size-4" />
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {user.email}
                  <span className="mt-1 block font-medium text-foreground">
                    {user.role} · {user.status}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Control Panel</Link>
                  </DropdownMenuItem>
                )}
                {isHR && (
                  <DropdownMenuItem asChild>
                    <Link to="/hr">HR Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    toast.success("Signed out of the Oscorp portal.");
                  }}
                >
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : employee ? null : (
            <Button size="sm" onClick={() => setAuthOpen(true)}>
              <ShieldCheck className="size-4" /> Portal Login
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-2 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
