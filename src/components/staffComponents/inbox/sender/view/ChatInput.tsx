"use client";

import React, { useState } from "react";
import type { ReceiverInstance } from "@/app/staff-portal/inbox/types";

interface ChatInputProps {
  selected: { receivers: ReceiverInstance[] };
  chatReceiverId: string | null;
  onSend: (receiverId: string, text: string) => void;
  role: "SENDER" | "RECEIVER";
}

export function ChatInput({ selected, chatReceiverId, onSend, role }: ChatInputProps) {
  // const [text, setText] = useState("");
  // const rid = role === "SENDER" ? (chatReceiverId || selected.receivers[0]?.receiverId) : (selected.receivers[0]?.receiverId ?? null);
  // const doSend = () => {
  //   if (rid && text.trim()) {
  //     onSend(rid, text);
  //     setText("");
  //   }
  // };
  // return (
  //   <div className="flex gap-2.5 p-2.5 border-t border-rcn-brand/20 bg-white/85">
  //     <input
  //       value={text}
  //       onChange={(e) => setText(e.target.value)}
  //       onKeyDown={(e) => e.key === "Enter" && doSend()}
  //       placeholder="Type a message…"
  //       className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-normal"
  //     />
  //     <button type="button" onClick={doSend} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">
  //       Send
  //     </button>
  //   </div>
  // );
}
