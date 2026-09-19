import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, ShieldCheck, Smartphone } from "lucide-react";

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
import { initOtpWidget, retryOtp, sendOtp, verifyOtp } from "@/lib/msg91";


export function OtpDialog({
  open,
  onOpenChange,
  defaultIdentifier = "",
  purpose = "Confirm it's really you before we open the portal.",
  onVerified,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultIdentifier?: string;
  purpose?: string;
  onVerified: () => void;
}) {
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"identify" | "verify">("identify");
  const [busy, setBusy] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    if (open) void initOtpWidget().catch(() => undefined);
  }, [open]);

  useEffect(() => {
    if (open && !seeded.current) {
      setIdentifier(defaultIdentifier);
      seeded.current = true;
    }
    if (!open) {
      seeded.current = false;
      setOtp("");
      setStage("identify");
    }
  }, [open, defaultIdentifier]);

  const send = async () => {
    const value = identifier.trim();
    if (!value) {
      toast.error("Enter a mobile number (with country code) or an email address.");
      return;
    }
    setBusy(true);
    try {
      await sendOtp(value);
      setStage("verify");
      toast.success("OTP sent", { description: `Verification code dispatched to ${value}.` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send the OTP.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    try {
      await retryOtp(null);
      toast.success("OTP resent.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not resend the OTP.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (otp.trim().length < 4) {
      toast.error("Enter the OTP you received.");
      return;
    }
    setBusy(true);
    try {
      const accessToken = await verifyOtp(otp.trim());
      const res = await fetch("/api/public/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      const result = (await res.json().catch(() => null)) as {
        verified?: boolean;
        message?: string;
      } | null;
      if (!res.ok || !result?.verified) {
        toast.error(result?.message ?? "Token verification failed.");
        return;
      }
      toast.success("Identity verified", { description: result.message });
      onOpenChange(false);
      onVerified();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Incorrect or expired OTP.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-accent" />
            Two-step verification
          </DialogTitle>
          <DialogDescription>{purpose}</DialogDescription>
        </DialogHeader>

        {stage === "identify" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="otp-identifier">Mobile number or work email</Label>
              <Input
                id="otp-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="919876543210 or you@oscorp.com"
              />
              <p className="text-xs text-muted-foreground">
                For SMS include the country code without “+”, e.g.{" "}
                <span className="font-mono text-foreground">919876543210</span>.
              </p>
            </div>
            <Button className="w-full" onClick={send} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Smartphone className="size-4" />}
              Send verification code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="otp-code">Enter OTP</Label>
              <Input
                id="otp-code"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="••••••"
                className="text-center font-mono text-lg tracking-[0.5em]"
              />
              <p className="text-xs text-muted-foreground">Sent to {identifier}</p>
            </div>
            <Button className="w-full" onClick={confirm} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              Verify & continue
            </Button>
            <div className="flex justify-between text-xs">
              <button
                type="button"
                className="text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setStage("identify")}
              >
                Change number
              </button>
              <button
                type="button"
                className="text-accent underline-offset-4 hover:underline"
                onClick={resend}
                disabled={busy}
              >
                Resend code
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
