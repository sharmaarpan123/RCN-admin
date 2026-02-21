import type { ChatMsg } from "@/app/staff-portal/inbox/types";

/** Raw message from POST /api/referral/chats/:referralId/start-chat (flexible shape). */
interface ApiChatMessage {
  from_role?: string;
  fromRole?: string;
  from_name?: string;
  fromName?: string;
  text?: string;
  created_at?: string;
  at?: string;
  message?: string;
  receiver_id?: string;
  sender_id?: string;
}

/** Map start-chat API response to ChatMsg[]. Handles data.messages, data.conversation.messages, or data.data.messages. */
export function mapStartChatResponseToMessages(res: unknown): ChatMsg[] {
  const data = (res as { data?: unknown })?.data ?? res;
  const obj = typeof data === "object" && data !== null ? data as Record<string, unknown> : {};
  let list = obj.messages ?? (obj.conversation as Record<string, unknown>)?.messages ?? (obj.data as Record<string, unknown>)?.messages;
  if (!Array.isArray(list)) return [];
  return (list as ApiChatMessage[]).map((m) => ({
    fromRole: (m.from_role ?? m.fromRole ?? "SENDER").toString().toUpperCase(),
    fromName: (m.from_name ?? m.fromName ?? "—").toString(),
    text: (m.text ?? m.message ?? "").toString(),
    at: new Date((m.created_at ?? m.at ?? Date.now()) as string | number),
    receiver_id: m.receiver_id ?? "",
    sender_id: m.sender_id ?? "",
  }));
}
