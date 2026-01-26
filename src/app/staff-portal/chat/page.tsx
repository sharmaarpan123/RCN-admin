"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { DEMO_REFERRALS } from "@/app/staff-portal/inbox/demo-data";
import { fmtDate } from "@/app/staff-portal/inbox/helpers";
import type { Referral, ChatMsg } from "@/app/staff-portal/inbox/types";
import { ChatInput } from "@/components/staffComponents/ChatInput";

const BOX_GRAD = "linear-gradient(90deg, rgba(15,107,58,.18), rgba(31,138,76,.12), rgba(31,138,76,.06))";

interface ChatListItem {
  referralId: string;
  receiverId: string;
  receiverName: string;
  patientName: string;
  lastMessage?: ChatMsg;
  unreadCount?: number;
}

export default function ChatPage() {
  const [referrals, setReferrals] = useState<Referral[]>(() => JSON.parse(JSON.stringify(DEMO_REFERRALS)));
  const [selectedChat, setSelectedChat] = useState<{ referralId: string; receiverId: string } | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Get all chats from referrals
  const chatList = useMemo<ChatListItem[]>(() => {
    const chats: ChatListItem[] = [];
    referrals.forEach((ref) => {
      Object.entries(ref.chatByReceiver || {}).forEach(([receiverId, messages]) => {
        const receiver = ref.receivers.find((r) => r.receiverId === receiverId);
        if (receiver) {
          const sortedMessages = [...messages].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
          chats.push({
            referralId: ref.id,
            receiverId,
            receiverName: receiver.name,
            patientName: `${ref.patient.first} ${ref.patient.last}`,
            lastMessage: sortedMessages[0],
          });
        }
      });
    });
    // Sort by last message time (most recent first)
    return chats.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.at).getTime() - new Date(a.lastMessage.at).getTime();
    });
  }, [referrals]);

  // Get selected referral and thread
  const selectedReferral = useMemo(() => {
    if (!selectedChat) return null;
    return referrals.find((r) => r.id === selectedChat.referralId) ?? null;
  }, [referrals, selectedChat]);

  const thread = useMemo(() => {
    if (!selectedChat || !selectedReferral) return [];
    return selectedReferral.chatByReceiver?.[selectedChat.receiverId] || [];
  }, [selectedChat, selectedReferral]);

  // Auto-select first chat if none selected
  useEffect(() => {
    if (!selectedChat && chatList.length > 0) {
      setSelectedChat({ referralId: chatList[0].referralId, receiverId: chatList[0].receiverId });
    }
  }, [chatList, selectedChat]);

  // Auto-scroll to bottom when thread updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [thread.length, selectedChat]);

  const sendChatMessage = useCallback(
    (refId: string, receiverId: string, text: string) => {
      const msg = (text || "").trim();
      if (!msg) return;
      setReferrals((prev) =>
        prev.map((r) => {
          if (r.id !== refId) return r;
          const chat = { ...r.chatByReceiver };
          const thread = chat[receiverId] || [];
          chat[receiverId] = [...thread, { at: new Date(), fromRole: "SENDER", fromName: "You", text: msg }];
          return { ...r, chatByReceiver: chat };
        })
      );
    },
    []
  );

  const selectedReceiver = selectedReferral?.receivers.find((r) => r.receiverId === selectedChat?.receiverId);

  return (
    <div className="max-w-[1600px] mx-auto p-[18px]">
      <div className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Chat</h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">Communicate with receivers about referrals.</p>
        </div>
        <div className="flex h-[calc(100vh-220px)] min-h-[600px]">
          {/* Sidebar - Chat List */}
          <div className="w-[320px] border-r border-slate-200 bg-white/50 overflow-y-auto">
            <div className="p-3 border-b border-slate-200 bg-white/90 sticky top-0 z-10">
              <h3 className="m-0 text-xs font-semibold text-rcn-muted">All Chats</h3>
            </div>
            {chatList.length > 0 ? (
              <div className="p-2">
                {chatList.map((chat) => {
                  const isSelected = selectedChat?.referralId === chat.referralId && selectedChat?.receiverId === chat.receiverId;
                  return (
                    <button
                      key={`${chat.referralId}-${chat.receiverId}`}
                      type="button"
                      onClick={() => setSelectedChat({ referralId: chat.referralId, receiverId: chat.receiverId })}
                      className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
                        isSelected ? "bg-rcn-brand/10 border-2 border-rcn-brand/30" : "bg-white/80 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-rcn-text truncate">{chat.receiverName}</div>
                          <div className="text-[11px] text-rcn-muted font-[850] truncate">{chat.patientName}</div>
                        </div>
                        {chat.lastMessage && (
                          <span className="text-[10px] text-rcn-muted font-black shrink-0">
                            {new Date(chat.lastMessage.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <div className="text-[11px] text-rcn-muted truncate mt-1">{chat.lastMessage.text}</div>
                      )}
                      <div className="text-[10px] text-rcn-muted font-black mt-1.5">Ref: {chat.referralId}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-rcn-muted text-sm">No chats yet.</div>
            )}
          </div>

          {/* Main Area - Messages */}
          <div className="flex-1 flex flex-col bg-white/30">
            {selectedChat && selectedReferral && selectedReceiver ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 border-b border-slate-200 bg-white/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="m-0 text-sm font-semibold">{selectedReceiver.name}</h3>
                      <p className="m-0 mt-0.5 text-xs text-rcn-muted font-[850]">
                        {selectedReferral.id} • {selectedReferral.patient.first} {selectedReferral.patient.last}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
                      Messaging Enabled
                    </span>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="border border-rcn-brand/20 rounded-[14px] bg-rcn-brand/5 m-3 flex-1 flex flex-col overflow-hidden">
                    <div className="flex gap-2.5 items-center justify-between p-2.5 bg-rcn-brand/10 border-b border-rcn-brand/20">
                      <span className="text-rcn-muted text-xs font-black">Thread</span>
                      <span className="text-rcn-muted text-xs">{selectedReceiver.name}</span>
                    </div>
                    <div ref={chatBodyRef} className="flex-1 overflow-auto p-2.5 flex flex-col gap-2.5">
                      {thread.length > 0 ? (
                        [...thread]
                          .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
                          .map((m, i) => {
                            const mine = m.fromRole === "SENDER";
                            return (
                              <div key={i} className={`flex gap-2.5 items-end ${mine ? "justify-end" : ""}`}>
                                <div
                                  className={`max-w-[78%] border rounded-[14px] p-2.5 shadow-[0_8px_18px_rgba(2,6,23,.06)] ${
                                    mine ? "bg-rcn-brand/10 border-rcn-brand/20" : "border-slate-200 bg-white"
                                  }`}
                                >
                                  <div className="text-[11px] text-rcn-muted font-black mb-1 flex gap-2 flex-wrap justify-between">
                                    {m.fromName} <span>{fmtDate(m.at)}</span>
                                  </div>
                                  <div className="text-[13px] font-[850] text-rcn-text leading-snug whitespace-pre-wrap">{m.text}</div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-2 text-rcn-muted font-black text-sm">No messages yet. Start the chat below.</div>
                      )}
                    </div>
                    <ChatInput
                      selected={selectedReferral}
                      chatReceiverId={selectedChat.receiverId}
                      onSend={(rid, t) => sendChatMessage(selectedChat.referralId, rid, t)}
                      role="SENDER"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-rcn-muted text-sm font-semibold">Select a chat to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
