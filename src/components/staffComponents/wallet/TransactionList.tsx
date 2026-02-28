"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthCreditsApi } from "@/apis/ApiCalls";
import { checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/staffQueryKeys";
import { TableLayout } from "@/components";
import type { TableColumn } from "@/components";
import CustomPagination from "@/components/CustomPagination";

/** Transaction item from GET /api/auth/credits with include_transactions */
export interface CreditTransaction {
  _id: string;
  owner_type?: string;
  owner_id?: string;
  transaction_type?: string;
  direction?: "in" | "out";
  amount?: number;
  currency?: string;
  description?: string;
  reference_type?: string;
  reference_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_by_user_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Pagination meta for credits transactions */
interface TransactionsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PAGE_SIZE = 20;

export function TransactionList() {
  const [transactionPage, setTransactionPage] = useState(1);

  const { data: transactionData, isLoading: transactionListLoading } = useQuery({
    queryKey: [...defaultQueryKeys.creditsTransactions, transactionPage, PAGE_SIZE],
    queryFn: async () => {
      const res = await getAuthCreditsApi({
        include_transactions: true,
        page: transactionPage,
        limit: PAGE_SIZE,
      });
      if (!checkResponse({ res })) {
        return {
          transactions: [] as CreditTransaction[],
          transactions_meta: {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          } as TransactionsMeta,
        };
      }
      const raw = res.data as {
        data?: {
          user_credits?: number;
          branch_credits?: number;
          transactions?: CreditTransaction[];
          transactions_meta?: TransactionsMeta;
        };
      };
      const data = raw?.data;
      const transactions = Array.isArray(data?.transactions) ? data.transactions : [];
      const transactions_meta: TransactionsMeta = data?.transactions_meta ?? {
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
      return { transactions, transactions_meta };
    },
  });

  const transactionColumns: TableColumn<CreditTransaction>[] = useMemo(
    () => [
      {
        head: "Date",   
        component: (row) => (
          <span className="text-[13px] text-rcn-text">
            {row.createdAt
              ? new Date(row.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        ),
      },
      {
        head: "Description",
        component: (row) => (
          <span className="text-[13px] text-rcn-text">{row.description ?? "—"}</span>
        ),
      },
      {
        head: "Direction",
        component: (row) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
              row.direction === "in"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {row.direction === "in" ? "In" : row.direction === "out" ? "Out" : "—"}
          </span>
        ),
      },
      {
        head: "Amount",
        component: (row) => (
          <span className="text-[13px] font-semibold text-rcn-text">
            {row.direction === "in" ? "+" : row.direction === "out" ? "−" : ""}
            {typeof row.amount === "number" ? row.amount : "—"} {row.currency ?? "USD"}
          </span>
        ),
      },
    ],
    [],
  );

  const meta = transactionData?.transactions_meta;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_30px_rgba(2,6,23,.07)] p-6 mb-6">
      <h2 className="text-lg font-semibold m-0 mb-4">Transaction History</h2>
      <div className="overflow-auto max-w-full">
        <TableLayout<CreditTransaction>
          columns={transactionColumns}
          data={transactionData?.transactions ?? []}
          size="sm"
          loader={transactionListLoading}
          tableClassName="[&_thead_tr]:bg-rcn-brand/10 [&_th]:border-slate-200 [&_th]:border-b [&_td]:border-slate-200 [&_td]:border-b [&_tr]:border-slate-200 [&_tr:hover]:bg-slate-50/50"
          getRowKey={(row) => row._id}
          emptyMessage="No transactions yet."
        />
        <CustomPagination
          total={meta?.total ?? 0}
          pageSize={meta?.limit ?? PAGE_SIZE}
          current={meta?.page ?? 1}
          onChange={(page) => setTransactionPage(page)}
        />
      </div>
    </div>
  );
}
