import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, LogIn, UserPlus, IdCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortal, employeePasscode } from "@/lib/portal-store";
import { OtpDialog } from "@/components/otp-dialog";

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { login, register, loginEmployee, employees } = usePortal();
  const [empRef, setEmpRef] = useState("");
  const [empPass, setEmpPass] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireOtp = (identifier: string, action: () => void) => {
    setOtpIdentifier(identifier);
    setPendingAction(() => action);
    setOtpOpen(true);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-accent" />
            Oscorp Secure Portal Access
          </DialogTitle>
          <DialogDescription>
            Authenticate to submit quotations, track contracts, or open the Admin Control Panel.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="employee">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employee">Employee</TabsTrigger>
            <TabsTrigger value="login">Sign in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="employee" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="emp-login-ref">Personnel reference ID</Label>
              <Input
                id="emp-login-ref"
                value={empRef}
                onChange={(e) => setEmpRef(e.target.value.toUpperCase())}
                placeholder="OSC-IN-00000"
                className="font-mono tracking-wide"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-login-pass">Personnel passcode</Label>
              <Input
                id="emp-login-pass"
                type="password"
                value={empPass}
                onChange={(e) => setEmpPass(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const match = employees.find(
                  (e) => e.ref.toLowerCase() === empRef.trim().toLowerCase(),
                );
                if (!match) {
                  toast.error("No personnel record found for this reference ID.");
                  return;
                }
                if (empPass !== employeePasscode(match.ref)) {
                  toast.error("Incorrect personnel passcode.");
                  return;
                }
                requireOtp(match.email, () => {
                  const res = loginEmployee(match.ref, empPass);
                  if (res.ok) {
                    toast.success(res.message, { description: "Personnel workspace unlocked." });
                    onOpenChange(false);
                  } else {
                    toast.error(res.message);
                  }
                });
              }}
            >
              <IdCard className="size-4" /> Verify & continue
            </Button>

            <p className="rounded-md border border-border bg-secondary/60 p-3 text-xs text-muted-foreground">
              Issued at onboarding by Oscorp IT. Format:{" "}
              <span className="font-mono text-foreground">Oscorp@</span> followed by the last five
              digits of your reference ID. Contact the HR desk to rotate it.
            </p>
          </TabsContent>

          <TabsContent value="login" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Work email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const res = login(email, password);
                if (res.ok) {
                  toast.success(res.message);
                  onOpenChange(false);
                } else {
                  toast.error(res.message);
                }
              }}
            >
              <LogIn className="size-4" /> Sign in
            </Button>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Full name</Label>
              <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Work email</Label>
              <Input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!name.trim() || !regEmail.trim() || regPassword.length < 6) {
                  toast.error("Enter a name, email and a password of at least 6 characters.");
                  return;
                }
                requireOtp(regEmail.trim(), () => {
                  const res = register(name.trim(), regEmail, regPassword);
                  if (res.ok) {
                    toast.success(res.message);
                    onOpenChange(false);
                  } else {
                    toast.error(res.message);
                  }
                });
              }}
            >
              <UserPlus className="size-4" /> Verify OTP & create account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <OtpDialog
        open={otpOpen}
        onOpenChange={setOtpOpen}
        defaultIdentifier={otpIdentifier}
        purpose="A one-time passcode has to be confirmed before the Oscorp portal session opens."
        onVerified={() => {
          pendingAction?.();
          setPendingAction(null);
        }}
      />
    </Dialog>
  );

}
