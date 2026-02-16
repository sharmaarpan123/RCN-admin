"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { fmtDate } from "@/app/staff-portal/inbox/helpers";
import type {
  ChatMsg,
  ReferralChatListItemApi,
  ReferralChatMessageApi,
  ReferralListResponse,
} from "@/app/staff-portal/inbox/types";
import {
  getReferralChatsApi,
  getReferralChatMessagesApi,
  postReferralChatReadApi,
} from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { useSocket } from "@/contexts/SocketContext";
import type { RootState } from "@/store";
import { ChatInput } from "@/components/staffComponents/ChatInput";
import {
  mapChatListItemApiToUi,
  mapChatMessageApiToUi,
  type ChatListItemUi,
} from "./chatApiMappers";

const CHAT_LIST_PAGE = 1;
const CHAT_LIST_LIMIT = 20;
const MESSAGES_PAGE = 1;
const MESSAGES_LIMIT = 50;

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = React.useState<{ chatId: string; referralId: string; receiverId: string } | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const { sendMessage, connected } = useSocket();
  const loginUser = useSelector((s: RootState) => s.auth.loginUser) as { _id?: string } | null;
  const currentUserId = loginUser?._id ?? null;

  // Close mobile sidebar when body scroll is locked
  useEffect(() => {
    if (mobileSidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // List chats
  const { data: chatsResponse, isLoading: isLoadingChats } = useQuery({
    queryKey: [...defaultQueryKeys.referralChatList, CHAT_LIST_PAGE, CHAT_LIST_LIMIT],
    queryFn: async (): Promise<ReferralListResponse<ReferralChatListItemApi>> => {
      const res = await getReferralChatsApi({ page: CHAT_LIST_PAGE, limit: CHAT_LIST_LIMIT });
      if (!checkResponse({ res })) return { data: [], meta: { page: 1, limit: CHAT_LIST_LIMIT, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
      const data = (res.data as { data?: ReferralChatListItemApi[] })?.data ?? (Array.isArray(res.data) ? res.data : []);
      const meta = (res.data as { meta?: ReferralListResponse<ReferralChatListItemApi>["meta"] })?.meta;
      return {
        data: Array.isArray(data) ? data : [],
        meta: meta ?? { page: CHAT_LIST_PAGE, limit: CHAT_LIST_LIMIT, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      };
    },
  });

  const chatList: ChatListItemUi[] = useMemo(() => {
    const list = chatsResponse?.data ?? [];
    const mapped = list.map(mapChatListItemApiToUi);
    return mapped.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.at).getTime() - new Date(a.lastMessage.at).getTime();
    });
  }, [chatsResponse?.data]);

  // Effective selected chat: use first in list when none selected
  const displayChat = useMemo(
    () =>
      selectedChat ??
      (chatList.length > 0
        ? {
            chatId: chatList[0].chatId,
            referralId: chatList[0].referralId,
            receiverId: chatList[0].receiverId,
          }
        : null),
    [selectedChat, chatList]
  );

  // Messages for selected chat
  const { data: messagesResponse } = useQuery({
    queryKey: [...defaultQueryKeys.referralChatMessages, displayChat?.chatId ?? ""],
    queryFn: async () => {
      if (!displayChat?.chatId) return { data: [] };
      const res = await getReferralChatMessagesApi(displayChat.chatId, {
        page: MESSAGES_PAGE,
        limit: MESSAGES_LIMIT,
      });
      if (!checkResponse({ res })) return { data: [] };
      const raw = (res.data as { data?: unknown[] })?.data ?? (Array.isArray(res.data) ? res.data : []);
      const list = Array.isArray(raw) ? raw : [];
      return { data: list };
    },
    enabled: !!displayChat?.chatId,
  });

  const thread: ChatMsg[] = useMemo(() => {
    const list = (messagesResponse?.data ?? []) as ReferralChatMessageApi[];
    return list.map((m) => mapChatMessageApiToUi(m, currentUserId ?? undefined));
  }, [messagesResponse?.data, currentUserId]);

  // Mark chat as read when selecting
  useEffect(() => {
    if (!displayChat?.chatId) return;
    postReferralChatReadApi(displayChat.chatId).then((res) => {
      checkResponse({ res });
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.referralChatList });
    });
  }, [displayChat?.chatId, queryClient]);

  // Auto-scroll to bottom when thread updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [thread.length, displayChat]);

  const sendChatMessage = (referralId: string, _receiverId: string, text: string) => {
    const msg = (text || "").trim();
    if (!msg) return;
    sendMessage(referralId, msg);
    // Optimistic refetch after a short delay so backend/socket can persist
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.referralChatMessages });
      queryClient.invalidateQueries({ queryKey: defaultQueryKeys.referralChatList });
    }, 300);
  };

  const selectedListItem = displayChat
    ? chatList.find(
        (c) => c.chatId === displayChat.chatId || (c.referralId === displayChat.referralId && c.receiverId === displayChat.receiverId)
      )
    : null;

  // ChatInput expects selected with receivers array
  const selectedForInput = useMemo(() => {
    if (!selectedListItem) return null;
    return {
      receivers: [
        {
          receiverId: selectedListItem.receiverId,
          name: selectedListItem.receiverName,
          email: "",
          status: "",
          paidUnlocked: false,
          updatedAt: new Date(),
          rejectReason: "",
        },
      ],
    };
  }, [selectedListItem]);

  return (
    <div className="max-w-[1600px] mx-auto p-[18px]">
      <div className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Chat</h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-[850]">
            Communicate with receivers about referrals.
          </p>
        </div>
        <div className="flex h-[calc(100vh-220px)] min-h-[600px] relative">
          {mobileSidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          <aside
            className={`
              w-[280px] sm:w-[320px] h-full shrink-0 border-r border-slate-200 bg-white overflow-y-auto
              md:relative md:translate-x-0 md:z-auto md:bg-white/50
              fixed top-0 left-0 z-50 shadow-xl md:shadow-none
              transition-transform duration-200 ease-out
              ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
            aria-label="Chat list"
          >
            <div className="p-3 border-b border-slate-200 bg-white/90 sticky top-0 z-10 flex items-center justify-between gap-2">
              <h3 className="m-0 text-xs font-semibold text-rcn-muted">All Chats</h3>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close chat list"
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-rcn-muted hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            {isLoadingChats ? (
              <div className="p-4 text-center text-rcn-muted text-sm">Loading chats…</div>
            ) : chatList.length > 0 ? (
              <div className="p-2">
                {chatList.map((chat) => {
                  const isSelected =
                    displayChat?.chatId === chat.chatId ||
                    (displayChat?.referralId === chat.referralId && displayChat?.receiverId === chat.receiverId);
                  return (
                    <button
                      key={chat.chatId}
                      type="button"
                      onClick={() => {
                        setSelectedChat({
                          chatId: chat.chatId,
                          referralId: chat.referralId,
                          receiverId: chat.receiverId,
                        });
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
                        isSelected
                          ? "bg-rcn-brand/10 border-2 border-rcn-brand/30"
                          : "bg-white/80 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-rcn-text truncate">
                            {chat.receiverName}
                          </div>
                          <div className="text-[11px] text-rcn-muted font-[850] truncate">
                            {chat.patientName}
                          </div>
                        </div>
                        {chat.lastMessage && (
                          <span className="text-[10px] text-rcn-muted font-black shrink-0">
                            {new Date(chat.lastMessage.at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <div className="text-[11px] text-rcn-muted truncate mt-1">
                          {chat.lastMessage.text}
                        </div>
                      )}
                      <div className="text-[10px] text-rcn-muted font-black mt-1.5">
                        Ref: {chat.referralId}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-rcn-muted text-sm">No chats yet.</div>
            )}
          </aside>

          <div className="flex-1 flex flex-col bg-white/30 min-w-0">
            <div className="md:hidden flex items-center gap-2 p-3 border-b border-slate-200 bg-white/90">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open chat list"
                className="w-10 h-10 flex items-center justify-center rounded-xl text-rcn-text hover:bg-slate-100 border border-slate-200"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-rcn-text">
                {selectedListItem ? selectedListItem.receiverName : "Chat"}
              </span>
              {connected && (
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Connected" aria-hidden />
              )}
            </div>

            {displayChat && selectedListItem && selectedForInput ? (
              <>
                <div className="p-3.5 border-b border-slate-200 bg-white/90 hidden md:block">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="m-0 text-sm font-semibold">{selectedListItem.receiverName}</h3>
                      <p className="m-0 mt-0.5 text-xs text-rcn-muted font-[850]">
                        {displayChat.referralId} • {selectedListItem.patientName}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
                      {connected ? "Messaging Enabled" : "Connecting…"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="border border-rcn-brand/20 rounded-[14px] bg-rcn-brand/5 m-3 flex-1 flex flex-col overflow-hidden">
                    <div className="flex gap-2.5 items-center justify-between p-2.5 bg-rcn-brand/10 border-b border-rcn-brand/20">
                      <span className="text-rcn-muted text-xs font-black">Thread</span>
                      <span className="text-rcn-muted text-xs">{selectedListItem.receiverName}</span>
                    </div>
                    <div
                      ref={chatBodyRef}
                      className="flex-1 overflow-auto p-2.5 flex flex-col gap-2.5"
                    >
                      {thread.length > 0 ? (
                        [...thread]
                          .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
                          .map((m, i) => {
                            const mine = m.fromRole === "SENDER";
                            return (
                              <div
                                key={i}
                                className={`flex gap-2.5 items-end ${mine ? "justify-end" : ""}`}
                              >
                                <div
                                  className={`max-w-[78%] border rounded-[14px] p-2.5 shadow-[0_8px_18px_rgba(2,6,23,.06)] ${
                                    mine
                                      ? "bg-rcn-brand/10 border-rcn-brand/20"
                                      : "border-slate-200 bg-white"
                                  }`}
                                >
                                  <div className="text-[11px] text-rcn-muted font-black mb-1 flex gap-2 flex-wrap justify-between">
                                    {m.fromName}
                                  </div>
                                  <div className="text-[13px] font-[450] text-rcn-text leading-snug whitespace-pre-wrap">
                                    {m.text}
                                  </div>
                                  <div className="text-[11px] text-rcn-muted font-black mb-1 flex gap-2 flex-wrap justify-end">
                                    <span>{fmtDate(m.at)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-2 text-rcn-muted font-black text-sm">
                          No messages yet. Start the chat below.
                        </div>
                      )}
                    </div>
                    <ChatInput
                      selected={selectedForInput}
                      chatReceiverId={displayChat.receiverId}
                      onSend={(rid, t) =>
                        sendChatMessage(displayChat.referralId, rid, t)
                      }
                      role="SENDER"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-rcn-muted text-sm font-semibold">
                    Select a chat to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
