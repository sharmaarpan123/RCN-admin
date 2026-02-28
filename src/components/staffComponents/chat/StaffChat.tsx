"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { fmtDate } from "@/app/staff-portal/inbox/helpers";
import {
  getReferralChatsApi,
  getReferralChatMessagesApi,
  postReferralChatReadApi,
  postReferralStartChatApi,
} from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { useSocket } from "@/contexts/SocketContext";
import type { RootState } from "@/store";
import { ChatInput } from "@/components/staffComponents/ChatInput";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { useStaffAuthLoginUser } from "@/store/slices/Auth/hooks";
export const dynamic = "force-dynamic";

const CHAT_LIST_PAGE = 1;
const CHAT_LIST_LIMIT = 20;
const MESSAGES_PAGE = 1;
const MESSAGES_LIMIT = 50;

/** Chat list item from GET /api/referral/chats response (data[]). */
export interface ApiChatListItem {
  referral_id: string;
  referral_sender_name?: string;
  referral_facility_name?: string;
  department_id?: string;
  department_name?: string;
  is_sender?: boolean;
  sender_id?: string;
  sender_name?: string;
  receiver_id?: string;
  receiver_name?: string;
  last_message?: {
    id?: string;
    message?: string;
    sender_id?: string;
    created_at?: string;
  };
  unread_count?: number;
  other_user_online?: boolean;
  patient_name?: string;
}

/** Response body from GET /api/referral/chats. */
export interface ApiChatListResponse {
  data: ApiChatListItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/** Message from GET /api/referral/chats/:referralId/messages response (data[]). */
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

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] =
    React.useState<ApiChatListItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const { sendMessage, connected } = useSocket();
  const loginUser = useSelector((s: RootState) => s.auth.loginUser) as {
    _id?: string;
  } | null;
  const currentUserId = loginUser?._id ?? null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const ReferredReferralId = searchParams.get("RedirectedReferralId");



  // Close mobile sidebar when body scroll is locked
  useEffect(() => {
    if (mobileSidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  // List chats — use API response as-is
  const { data: chatsResponse, isLoading: isLoadingChats } = useQuery({
    queryKey: [
      ...defaultQueryKeys.referralChatList,
      CHAT_LIST_PAGE,
      CHAT_LIST_LIMIT,
    ],
    queryFn: async (): Promise<ApiChatListResponse> => {
      const res = await getReferralChatsApi({
        page: CHAT_LIST_PAGE,
        limit: CHAT_LIST_LIMIT,
      });
      if (!checkResponse({ res })) {
        return {
          data: [],
          meta: {
            page: CHAT_LIST_PAGE,
            limit: CHAT_LIST_LIMIT,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
      const body = res.data as ApiChatListResponse;
      return {
        data: Array.isArray(body?.data) ? body.data : [],
        meta: body?.meta ?? {
          page: CHAT_LIST_PAGE,
          limit: CHAT_LIST_LIMIT,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    },
  });

  const chatList: ApiChatListItem[] = useMemo(
    () => chatsResponse?.data ?? [],
    [chatsResponse?.data],
  );

  // Effective selected chat: use first in list when none selected
  const displayChat = selectedChat



  // Messages for selected chat
  const { data: messagesResponse, isLoading: isLoadingMessages } = useQuery({
    queryKey: [
      ...defaultQueryKeys.referralChatMessages,
      displayChat?.referral_id ?? "",
    ],
    queryFn: async () => {
      if (!displayChat?.referral_id) return { data: [] };
      const res = await getReferralChatMessagesApi(displayChat.referral_id, {
        page: MESSAGES_PAGE,
        limit: MESSAGES_LIMIT,
      });
      if (!checkResponse({ res })) return { data: [] };
      const body = res.data as { data?: unknown[] };
      const list = Array.isArray(body?.data) ? body.data : [];
      return { data: list };
    },
    enabled: !!displayChat?.referral_id,
  });

  const thread: ApiChatMessage[] = useMemo(() => {
    const list = (messagesResponse?.data ?? []) as ApiChatMessage[];
    return [...list].sort(
      (a, b) =>
        new Date(a.created_at ?? 0).getTime() -
        new Date(b.created_at ?? 0).getTime(),
    );
  }, [messagesResponse?.data]);

  // Mark chat as read when selecting
  useEffect(() => {
    if (!displayChat?.referral_id) return;
    postReferralChatReadApi(displayChat.referral_id).then((res) => {
      checkResponse({ res });
      queryClient.invalidateQueries({
        queryKey: defaultQueryKeys.referralChatList,
      });
    });
  }, [displayChat?.referral_id, queryClient]);

  // Auto-scroll to bottom when thread updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [thread.length, displayChat]);

  const sendChatMessage = (
    referralId: string,
    _receiverId: string,
    text: string,
    departmentId?: string,
  ) => {
    const msg = (text || "").trim();
    if (!msg) return;
    sendMessage(referralId, msg, departmentId, () => {
      queryClient.invalidateQueries({
        queryKey: defaultQueryKeys.referralChatMessages,
      });
      queryClient.invalidateQueries({
        queryKey: defaultQueryKeys.referralChatList,
      });
    });
    // Optimistic refetch after a short delay so backend/socket can persist

  };


  const selectedForInput = useMemo(() => {
    if (!displayChat) return null;
    return {
      receivers: [
        {
          receiverId: displayChat.receiver_id ?? "",
          name: displayChat.receiver_name ?? "—",
          email: "",
          status: "",
          paidUnlocked: false,
          updatedAt: new Date(),
          rejectReason: "",
        },
      ],
    };
  }, [displayChat]);

  const getRedirectedChat = async (ReferredReferralId: string) => {
    const res = await postReferralStartChatApi(ReferredReferralId);
    if (!checkResponse({ res })) return;

    const findItemFromTheCurrentList =
      chatList.find((c) => c.referral_id ===
        ReferredReferralId) ?? null;

    setSelectedChat(
      findItemFromTheCurrentList ?? res?.data?.data
    );

    router.replace(`/staff-portal/chat`);

  };

  useEffect(() => {
    if (
      chatList?.length &&
      ReferredReferralId &&
      typeof ReferredReferralId === "string"
    ) {
      queueMicrotask(() => {
        getRedirectedChat(ReferredReferralId);
      });
    }
  }, [ReferredReferralId, chatList, router]);

  return (
    <div className="max-w-[1600px] mx-auto p-[18px]">
      <div className="border border-slate-200 bg-white/65 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.07)] overflow-hidden">
        <div className="p-3.5 pt-3 pb-2.5 border-b border-slate-200 bg-white/90">
          <h2 className="m-0 text-sm font-semibold tracking-wide">Chat</h2>
          <p className="m-0 mt-1 text-rcn-muted text-xs font-semibold">
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
              <h3 className="m-0 text-xs font-semibold text-rcn-muted">
                All Chats
              </h3>
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
              <div className="p-4 text-center text-rcn-muted text-sm">
                Loading chats…
              </div>
            ) : chatList.length > 0 ? (
              <div className="p-2">
                {chatList.map((chat) => {
                  const isSelected =
                    selectedChat?.referral_id === chat.referral_id ||
                    (selectedChat?.referral_id === chat.referral_id &&
                      (chat.receiver_id ?? "") ===
                      (selectedChat?.receiver_id ?? ""));
                  return (
                    <button
                      key={`${chat.referral_id}_${chat.receiver_id ?? ""}`}
                      type="button"
                      onClick={() => {
                        setSelectedChat(chat);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${isSelected
                        ? "bg-rcn-brand/10 border-2 border-rcn-brand/30"
                        : "bg-white/80 border border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-rcn-muted font-bold truncate">
                            {chat.is_sender ? chat.receiver_name ?? "—" : chat.referral_sender_name ?? "—"}
                          </div>
                          {chat.referral_id?.slice(-8) ?? "—"}
                          {chat.last_message && (
                            <div className="text-[11px] text-rcn-muted truncate mt-1">
                              {(chat.last_message.message ?? "").toString()}
                            </div>
                          )}
                        </div>
                        <div>

                          {chat.last_message?.created_at && (
                            <span className="text-[10px] text-rcn-muted font-black shrink-0">
                              {new Date(
                                chat.last_message.created_at,
                              ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          {!!chat.unread_count && (
                            <div className="bg-rcn-brand text-center  p-1 rounded-full text-white text-xs font-semibold  truncate">
                              {chat.unread_count > 99 ? "99+" : chat.unread_count}
                            </div>
                          )}
                        </div>
                      </div>

                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-rcn-muted text-sm">
                No chats yet.
              </div>
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
                {displayChat ? (displayChat.receiver_name ?? "—") : "Chat"}
              </span>
              {connected && (
                <span
                  className="w-2 h-2 rounded-full bg-green-500 shrink-0"
                  title="Connected"
                  aria-hidden
                />
              )}
            </div>

            {displayChat && selectedForInput ? (
              <>
                <div className="p-3.5 border-b border-slate-200 bg-white/90 hidden md:block">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="m-0 mt-0.5 text-xs text-rcn-muted font-semibold">
                        {displayChat.patient_name ??
                          displayChat.referral_facility_name ??
                          displayChat.referral_id ??
                          "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="border border-rcn-brand/20 rounded-[14px] bg-rcn-brand/5 m-3 flex-1 flex flex-col overflow-hidden">
                    <div
                      ref={chatBodyRef}
                      className="flex-1 overflow-auto p-2.5 flex flex-col gap-2.5"
                    >
                      {isLoadingMessages ? (
                        <div className="p-2 text-rcn-muted font-black text-sm text-center relative">
                          <div className=" inset-0 z-1 flex items-center justify-center bg-slate-100/80 rounded">
                            <span
                              className="h-4 w-4 border-2 border-rcn-brand border-t-transparent rounded-full animate-spin"
                              aria-hidden
                            />
                          </div>
                        </div>
                      ) : thread.length > 0 ? (
                        thread.map((m, i) => {
                          const mine = m.sender_id === currentUserId;
                          return (
                            <div
                              key={m.id ?? `msg-${i}-${m.created_at ?? ""}`}
                              className={`flex gap-2.5 items-end ${mine ? "justify-end" : ""}`}
                            >
                              <div
                                className={`max-w-[78%] border rounded-[14px] p-2.5 shadow-[0_8px_18px_rgba(2,6,23,.06)] ${mine
                                  ? "bg-rcn-brand/10 border-rcn-brand/20"
                                  : "border-slate-200 bg-white"
                                  }`}
                              >
                                <div className="text-[11px] text-rcn-muted font-black mb-1 flex gap-2 flex-wrap justify-between">
                                  {m.sender_name ?? "—"}
                                </div>
                                <div className="text-[13px] font-semibold  leading-snug whitespace-pre-wrap">
                                  {m.message}
                                </div>
                                <div className="text-[11px] text-rcn-muted  mb-1 flex gap-2 flex-wrap justify-end">
                                  <span>
                                    {moment(m.created_at ?? 0).format("DD/MM/YYYY , hh:mm a")}
                                  </span>
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

                      chatReceiverId={displayChat?.referral_id ?? ""}
                      onSend={(rid, t) =>
                        sendChatMessage(displayChat?.referral_id ?? "", rid, t, displayChat?.department_id ?? "")
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
