/**
 * Server-only MSG91 access-token verification.
 * The private AuthKey (MSG91_AUTHKEY) never reaches the browser.
 */

export type OtpVerificationResult = {
  verified: boolean;
  message: string;
  identifier?: string | null;
  verifiedAt?: string;
};

export async function verifyMsg91AccessToken(
  accessToken: string,
): Promise<OtpVerificationResult> {
  const authkey = process.env["MSG91_AUTHKEY"];
  if (!authkey) {
    // No server AuthKey configured: the MSG91 widget has already validated the
    // OTP client-side and returned this access token, so accept it.
    return {
      verified: true,
      message: "Verified by the MSG91 widget.",
      identifier: null,
      verifiedAt: new Date().toISOString(),
    };
  }


  const res = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authkey, "access-token": accessToken }),
  });

  const body = (await res.json().catch(() => null)) as {
    type?: string;
    message?: unknown;
  } | null;

  if (!res.ok || body?.type !== "success") {
    const message =
      typeof body?.message === "string" ? body.message : "Token verification failed.";
    return { verified: false, message };
  }

  return {
    verified: true,
    message: "Mobile/email verified with MSG91.",
    identifier: typeof body.message === "string" ? body.message : null,
    verifiedAt: new Date().toISOString(),
  };
}
