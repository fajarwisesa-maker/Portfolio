import { createMockAdapter } from "./mock";
import { createSupabaseAdapter } from "./supabase";
import type { RealtimeAdapter } from "./types";

let adapter: RealtimeAdapter | null = null;

/** One adapter per browser tab. Supabase when keys are present, otherwise the offline mock. */
export function getRealtime(): RealtimeAdapter {
  if (adapter) return adapter;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  adapter = url && key ? createSupabaseAdapter(url, key) : createMockAdapter();
  return adapter;
}
export * from "./types";
