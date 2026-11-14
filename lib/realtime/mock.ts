// Offline stand-in for Supabase: localStorage + BroadcastChannel.
// Open the site in two tabs and they stay in sync, no account needed.
import type { GuestComment, RealtimeAdapter, RealtimeEvent } from "./types";

const K_COMMENTS = "porto.mock.comments";
const K_COFFEE = "porto.mock.coffee";
const CHANNEL = "porto.mock.realtime";

const seed = (): GuestComment[] => [
  {
    id: "seed-owner",
    name: "Fajar",
    message: "Welcome! Leave a note, a question or just say hi. I read every one.",
    avatar: "/media/portrait-casual.webp",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    reactions: {},
    owner: true,
  },
];

const read = <T,>(key: string, fallback: () => T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback();
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

export function createMockAdapter(): RealtimeAdapter {
  const listeners = new Set<(e: RealtimeEvent) => void>();
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
  channel?.addEventListener("message", (ev) => listeners.forEach((l) => l(ev.data as RealtimeEvent)));

  const emit = (e: RealtimeEvent) => {
    listeners.forEach((l) => l(e));
    channel?.postMessage(e);
  };

  return {
    kind: "mock",
    async listComments() {
      return read<GuestComment[]>(K_COMMENTS, seed).sort((a, b) => b.createdAt - a.createdAt);
    },
    async postComment({ name, message, avatar }) {
      const comment: GuestComment = {
        id: crypto.randomUUID(),
        name,
        message,
        avatar: avatar ? await blobToDataUrl(avatar) : null,
        createdAt: Date.now(),
        reactions: {},
      };
      write(K_COMMENTS, [comment, ...read<GuestComment[]>(K_COMMENTS, seed)].slice(0, 200));
      emit({ type: "comment", comment });
      return comment;
    },
    async react(commentId, emoji, delta) {
      const all = read<GuestComment[]>(K_COMMENTS, seed);
      const c = all.find((x) => x.id === commentId);
      if (!c) return;
      c.reactions[emoji] = Math.max(0, (c.reactions[emoji] ?? 0) + delta);
      write(K_COMMENTS, all);
      emit({ type: "reaction", commentId, emoji, count: c.reactions[emoji] });
    },
    async getCoffee() {
      return read<number>(K_COFFEE, () => 0);
    },
    async brewCoffee() {
      const count = read<number>(K_COFFEE, () => 0) + 1;
      write(K_COFFEE, count);
      emit({ type: "coffee", count });
      return count;
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
  };
}
