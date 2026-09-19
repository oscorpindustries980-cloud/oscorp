/**
 * MSG91 OTP widget loader + typed wrappers.
 *
 * The widgetId / tokenAuth pair is a publishable client credential (it is meant
 * to be embedded in the page). The private MSG91 AuthKey is NEVER used here —
 * the access token returned by the widget is verified server-side in
 * `src/lib/otp.functions.ts`.
 */

export const MSG91_WIDGET_ID = "366863634353393835383430";
export const MSG91_TOKEN_AUTH = "556690T3KU6IkWyF6a700b3bP1";

const SCRIPT_URLS = [
  "https://verify.msg91.com/otp-provider.js",
  "https://verify.phone91.com/otp-provider.js",
];

type Cb = (data: unknown) => void;

declare global {
  interface Window {
    initSendOTP?: (config: Record<string, unknown>) => void;
    sendOtp?: (identifier: string, success: Cb, failure: Cb) => void;
    retryOtp?: (channel: string | null, success: Cb, failure: Cb) => void;
    verifyOtp?: (otp: string, success: Cb, failure: Cb) => void;
    isOTPVerified?: (success: Cb, failure: Cb) => void;
  }
}

let loader: Promise<void> | null = null;

function loadScript(index = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = SCRIPT_URLS[index];
    if (!url) {
      reject(new Error("Unable to load the MSG91 OTP provider script."));
      return;
    }
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => loadScript(index + 1).then(resolve, reject);
    document.head.appendChild(s);
  });
}

/** Loads the widget script once and initialises it in headless (exposeMethods) mode. */
export function initOtpWidget(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (loader) return loader;

  loader = loadScript().then(() => {
    if (typeof window.initSendOTP !== "function") {
      throw new Error("MSG91 widget failed to initialise.");
    }
    window.initSendOTP({
      widgetId: MSG91_WIDGET_ID,
      tokenAuth: MSG91_TOKEN_AUTH,
      exposeMethods: true,
      success: (data: unknown) => console.log("[msg91] success", data),
      failure: (error: unknown) => console.log("[msg91] failure", error),
    });
  });

  return loader;
}

function toMessage(err: unknown, fallback: string) {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return fallback;
}

function call(
  method: "sendOtp" | "retryOtp" | "verifyOtp",
  arg: string | null,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fn = window[method];
    if (typeof fn !== "function") {
      reject(new Error("OTP service is not ready yet. Please retry in a moment."));
      return;
    }
    (fn as (a: unknown, s: Cb, f: Cb) => void)(
      arg,
      (data: unknown) => {
        const msg =
          data && typeof data === "object"
            ? String((data as { message?: unknown }).message ?? "")
            : String(data ?? "");
        resolve(msg);
      },
      (error: unknown) => reject(new Error(toMessage(error, "OTP request failed."))),
    );
  });
}

/** identifier = country-code prefixed mobile (e.g. 919876543210) or an email address. */
export async function sendOtp(identifier: string) {
  await initOtpWidget();
  return call("sendOtp", identifier);
}

export async function retryOtp(channel: "11" | "12" | null = null) {
  await initOtpWidget();
  return call("retryOtp", channel);
}

/** Resolves with the JWT access token to be verified server-side. */
export async function verifyOtp(otp: string) {
  await initOtpWidget();
  return call("verifyOtp", otp);
}
