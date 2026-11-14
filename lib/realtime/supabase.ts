// Real backend. Used automatically once NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY are set (see supabase/schema.sql).
import { createClient } from "@supabase/supabase-js";
import type { GuestComment, RealtimeAdapter, RealtimeEvent } from "./types";

type Row = { id: string; name: string; message: string; avatar_url: string | null; created_at: string };
type ReactionRow = { comment_id: string; emoji: string; count: number };

const toComment = (r: Row, reactions: Record<string, number> = {}): GuestComment => ({
  id: r.id,
  name: r.name,
  message: r.message,
  avatar: r.avatar_url,
  createdAt: new Date(r.created_at).getTime(),
  reactions,
});

export function createSupabaseAdapter(url: string, anonKey: string): RealtimeAdapter {
  const sb = createClient(url, anonKey);
  const listeners = new Set<(e: RealtimeEvent) => void>();
  const emit = (e: RealtimeEvent) => listeners.forEach((l) => l(e));
  let started = false;

  const start = () => {
    if (started) return;
    started = true;
    sb.channel("porto")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" }, (p) => {
        const row = p.new as Row & { hidden?: boolean };
        if (!row.hidden) emit({ type: "comment", comment: toComment(row) });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comment_reactions" }, (p) => {
        const row = p.new as ReactionRow;
        if (row?.comment_id) emit({ type: "reaction", commentId: row.comment_id, emoji: row.emoji, count: row.count });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "coffee" }, (p) => {
        emit({ type: "coffee", count: Number((p.new as { count: number }).count) });
      })
      .subscribe();
  };

  return {
    kind: "supabase",
    async listComments() {
      const [{ data: rows, error }, { data: reacts }] = await Promise.all([
        sb
          .from("comments")
          .select("id,name,message,avatar_url,created_at")
          .eq("hidden", false)
          .order("created_at", { ascending: false })
          .limit(200),
        sb.from("comment_reactions").select("comment_id,emoji,count"),
      ]);
      if (error) throw error;
      const byComment = new Map<string, Record<string, number>>();
      for (const r of (reacts ?? []) as ReactionRow[]) {
        byComment.set(r.comment_id, { ...(byComment.get(r.comment_id) ?? {}), [r.emoji]: r.count });
      }
      return ((rows ?? []) as Row[]).map((r) => toComment(r, byComment.get(r.id)));
    },
    async postComment({ name, message, avatar }) {
      let avatar_url: string | null = null;
      if (avatar) {
        const path = `${crypto.randomUUID()}.webp`;
        const up = await sb.storage.from("avatars").upload(path, avatar, { contentType: "image/webp" });
        if (!up.error) avatar_url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
      const { data, error } = await sb
        .from("comments")
        .insert({ name, message, avatar_url })
        .select("id,name,message,avatar_url,created_at")
        .single();
      if (error) throw error;
      return toComment(data as Row);
    },
    async react(commentId, emoji, delta) {
      const { error } = await sb.rpc("react", { p_comment_id: commentId, p_emoji: emoji, p_delta: delta });
      if (error) throw error;
    },
    async getCoffee() {
      const { data, error } = await sb.from("coffee").select("count").eq("id", 1).single();
      if (error) throw error;
      return Number(data.count);
    },
    async brewCoffee() {
      const { data, error } = await sb.rpc("brew_coffee");
      if (error) throw error;
      return Number(data);
    },
    subscribe(cb) {
      listeners.add(cb);
      start();
      return () => {
        listeners.delete(cb);
      };
    },
  };
}
