import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { verifyMsg91AccessToken } from "@/lib/otp.server";

const schema = z.object({ accessToken: z.string().min(10).max(4096) });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export const Route = createFileRoute("/api/public/verify-otp")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const json = await request.json().catch(() => null);
        const parsed = schema.safeParse(json);
        if (!parsed.success) {
          return Response.json(
            { verified: false, message: "A valid access token is required." },
            { status: 400, headers: cors },
          );
        }

        const result = await verifyMsg91AccessToken(parsed.data.accessToken);
        return Response.json(
          {
            ...result,
            session: result.verified
              ? { authenticated: true, issuedAt: result.verifiedAt, provider: "msg91" }
              : null,
          },
          { status: result.verified ? 200 : 401, headers: cors },
        );
      },
    },
  },
});
