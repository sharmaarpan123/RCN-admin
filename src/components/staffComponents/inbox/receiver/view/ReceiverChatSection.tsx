"use client";

import { postReferralStartChatApi } from "@/apis/ApiCalls";
import { fmtDate } from "@/app/staff-portal/inbox/helpers";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { useStaffAuthLoginUser } from "@/store/slices/Auth/hooks";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RefObject, useEffect, useMemo } from "react";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

/** Message shape from POST /api/referral/chats/:referralId/start-chat (data.messages[]). */
export interface ApiChatMessage {
  id?: string;
  message: string;
  sender_id?: string;
  sender_name?: string;
  receiver_id?: string;
  read_by_sender?: boolean;
  read_by_receiver?: boolean;
  created_at?: string;
}

interface ReceiverChatSectionProps {
  referralId: string;
  /** Extra messages to show (e.g. sent locally); same shape as API (message, sender_id, sender_name, created_at). */
  localMessages?: ApiChatMessage[];
  chatBodyRef: RefObject<HTMLDivElement | null>;
}

export function ReceiverChatSection({
  referralId,
  localMessages = [],
  chatBodyRef,
}: ReceiverChatSectionProps) {
  const router = useRouter();
  const { loginUser } = useStaffAuthLoginUser();

  const { data: chatData, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.referralChat, referralId],
    queryFn: async () => {
      const res = await postReferralStartChatApi(referralId);
      if (!checkResponse({ res })) return null;
      const body = res.data as { data?: { messages?: ApiChatMessage[] } };
      return body?.data ?? null;
    },
    enabled: !!referralId,
  });

  const thread = useMemo(() => {
    const messages: ApiChatMessage[] = chatData?.messages ?? [];
    return [...messages, ...localMessages].sort(
      (a, b) =>
        new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
    );
  }, [chatData?.messages, localMessages]);

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [thread.length, chatBodyRef]);

  const doSend = () => {
    router.push(`/staff-portal/chat?RedirectedReferralId=${referralId}`);
  };

  return (
    <div id="secChat" className={SECTION_CLASS}>
      <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
        <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">💬</span>
          Chat with Sender
        </h4>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Messaging Enabled</span>
      </div>
      <div className="border border-rcn-brand/20 rounded-[14px] bg-rcn-brand/5 overflow-hidden">
        <div className="flex gap-2.5 items-center justify-between p-2.5 bg-rcn-brand/10 border-b border-rcn-brand/20">
          <span className="text-rcn-muted text-xs font-black">Thread</span>
          <span className="text-rcn-muted text-xs">Sender</span>
        </div>
        <div ref={chatBodyRef} className="max-h-[280px] overflow-auto p-2.5 flex flex-col gap-2.5">
          {isLoading ? (
            <div className="p-2 text-rcn-muted font-black text-sm">Loading conversation…</div>
          ) : thread.length ? (
            thread.map((m, i) => {
              const mine = m.sender_id === loginUser?._id;
              return (
                <div key={m.id ?? i} className={`flex gap-2.5 items-end ${mine ? "justify-end" : ""}`}>
                  <div className={`max-w-[78%] border rounded-[14px] p-2.5 shadow-[0_8px_18px_rgba(2,6,23,.06)] ${mine ? "bg-rcn-brand/10 border-rcn-brand/20" : "border-slate-200 bg-white"}`}>
                    <div className="text-[11px] text-rcn-muted font-black mb-1 flex gap-2 flex-wrap justify-between">
                      {m.sender_name ?? "—"} <span>{fmtDate(new Date(m.created_at ?? 0))}</span>
                    </div>
                    <div className="text-[13px] font-[850] text-rcn-text leading-snug whitespace-pre-wrap">{m.message}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-2 text-rcn-muted font-black text-sm">No messages yet. Start the chat below.</div>
          )}
        </div>
        <div className="flex gap-2.5 p-2.5 border-t border-rcn-brand/20 bg-white/85">
          <button type="button" onClick={doSend} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">
            {thread.length ? "Continue Chat" : "Start Chat"}
          </button>
        </div>
      </div>
    </div>
  );
}
