import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { verifyMsg91AccessToken } from "./otp.server";

const schema = z.object({ accessToken: z.string().min(10).max(4096) });

/** Server-side confirmation of an MSG91 widget access token. */
export const verifyOtpAccessToken = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => verifyMsg91AccessToken(data.accessToken));
