import type { ChatMsg } from "@/app/staff-portal/inbox/types";
import type { ReferralChatListItemApi, ReferralChatMessageApi } from "@/app/staff-portal/inbox/types";

export interface ChatListItemUi {
  chatId: string;
  referralId: string;
  receiverId: string;
  receiverName: string;
  patientName: string;
  lastMessage?: ChatMsg;
  unreadCount?: number;
}

/** Map GET /api/referral/chats list item to UI shape. */
export function mapChatListItemApiToUi(item: ReferralChatListItemApi): ChatListItemUi {
  const last = item.last_message;
  const lastMsg = last
    ? {
        at: new Date((last.created_at ?? 0) as string | number),
        fromRole: "SENDER",
        fromName: "—",
        text: (last.message ?? last.text ?? "").toString(),
      }
    : undefined;
  return {
    chatId: item._id,
    referralId: item.referral_id ?? item._id,
    receiverId: item.receiver_id ?? "",
    receiverName: item.receiver_name ?? "—",
    patientName: item.patient_name ?? "—",
    lastMessage: lastMsg,
    unreadCount: item.unread_count,
  };
}

/** Map GET /api/referral/chats/:id/messages item to ChatMsg. */
export function mapChatMessageApiToUi(m: ReferralChatMessageApi, currentUserId?: string): ChatMsg {
  const text = (m.message ?? m.text ?? "").toString();
  const at = new Date((m.created_at ?? 0) as string | number);
  const fromName = (m.sender_name ?? "—").toString();
  const isMine = currentUserId ? m.sender_id === currentUserId : false;
  return {
    at,
    fromRole: isMine ? "SENDER" : "RECEIVER",
    fromName,
    text,
  };
}
