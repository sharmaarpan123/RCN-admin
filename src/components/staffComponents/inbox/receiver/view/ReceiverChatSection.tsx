"use client";

import React, { RefObject } from "react";
import { fmtDate } from "@/app/staff-portal/inbox/helpers";
import type { ChatMsg } from "@/app/staff-portal/inbox/types";
import type { ReceiverInstance } from "@/app/staff-portal/inbox/types";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { ChatInput } from "@/components/staffComponents/inbox/sender/view/ChatInput";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

interface ReceiverChatSectionProps {
  thread: ChatMsg[];
  chatBodyRef: RefObject<HTMLDivElement | null>;
  receiverId: string | null;
  chatInputSelected: { receivers: ReceiverInstance[] };
  onSend: (receiverId: string, text: string) => void;
  /** True while start-chat API is loading */
  isLoading?: boolean;
}

export function ReceiverChatSection({
  thread,
  chatBodyRef,
  receiverId,
  chatInputSelected,
  onSend,
  isLoading,
}: ReceiverChatSectionProps) {
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
            [...thread]
              .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
              .map((m, i) => {
                const mine = m.fromRole === "RECEIVER";
                return (
                  <div key={i} className={`flex gap-2.5 items-end ${mine ? "justify-end" : ""}`}>
                    <div className={`max-w-[78%] border rounded-[14px] p-2.5 shadow-[0_8px_18px_rgba(2,6,23,.06)] ${mine ? "bg-rcn-brand/10 border-rcn-brand/20" : "border-slate-200 bg-white"}`}>
                      <div className="text-[11px] text-rcn-muted font-black mb-1 flex gap-2 flex-wrap justify-between">{m.fromName} <span>{fmtDate(m.at)}</span></div>
                      <div className="text-[13px] font-[850] text-rcn-text leading-snug whitespace-pre-wrap">{m.text}</div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-2 text-rcn-muted font-black text-sm">No messages yet. Start the chat below.</div>
          )}
        </div>
        <ChatInput selected={chatInputSelected} chatReceiverId={receiverId} onSend={onSend} role="RECEIVER" />
      </div>
    </div>
  );
}
