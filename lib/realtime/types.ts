export const REACTIONS = ["👍", "❤️", "🔥", "😂", "☕"] as const;
export type Reaction = (typeof REACTIONS)[number];

export type GuestComment = {
  id: string;
  name: string;
  message: string;
  avatar: string | null;
  createdAt: number; // ms epoch
  reactions: Record<string, number>;
  owner?: boolean;
};

export type RealtimeEvent =
  | { type: "comment"; comment: GuestComment }
  | { type: "reaction"; commentId: string; emoji: string; count: number }
  | { type: "coffee"; count: number };

export interface RealtimeAdapter {
  readonly kind: "mock" | "supabase";
  listComments(): Promise<GuestComment[]>;
  postComment(input: { name: string; message: string; avatar: Blob | null }): Promise<GuestComment>;
  /** delta 1 adds a reaction, -1 takes it back. */
  react(commentId: string, emoji: Reaction, delta: 1 | -1): Promise<void>;
  getCoffee(): Promise<number>;
  brewCoffee(): Promise<number>;
  subscribe(cb: (e: RealtimeEvent) => void): () => void;
}

export const LIMITS = {
  name: 40,
  message: 500,
  commentCooldownMs: 30_000,
};
