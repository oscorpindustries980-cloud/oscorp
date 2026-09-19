/**
 * Tiny Supabase REST client.
 *
 * This intentionally uses the public/publishable key only, so the portal does
 * not need the Supabase SDK bundle. Keep the service-role key server-side and
 * never put it in VITE_* variables.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

const endpoint = (table: string) => `${supabaseUrl}/rest/v1/${table}`;
const headers = () => ({
  apikey: supabaseKey!,
  Authorization: `Bearer ${supabaseKey!}`,
  "Content-Type": "application/json",
});

export async function dbSelect<T = any>(table: string, params: Record<string, string> = {}): Promise<T[]> {
  if (!supabaseConfigured) return [];
  const url = new URL(endpoint(table));
  url.searchParams.set("select", "*");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T[];
}

export async function dbInsert<T = any>(table: string, payload: Record<string, unknown>): Promise<T> {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const response = await fetch(endpoint(table), {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  const rows = (await response.json()) as T[];
  return rows[0];
}

export async function dbUpdate<T = any>(
  table: string,
  filters: Record<string, string>,
  payload: Record<string, unknown>,
): Promise<T | null> {
  if (!supabaseConfigured) throw new Error("Supabase is not configured.");
  const url = new URL(endpoint(table));
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: "PATCH",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await response.text());
  const rows = (await response.json()) as T[];
  return rows[0] ?? null;
}
