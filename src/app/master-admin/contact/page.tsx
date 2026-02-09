"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, ConfirmModal, Modal, TableLayout } from "@/components";
import type { TableColumn } from "@/components";
import {
  getAdminContactListApi,
  getAdminContactDetailApi,
  deleteAdminContactApi,
} from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";

/** Contact query item from list API */
type ContactListItem = {
  _id: string;
  email?: string;
  phone_number?: string;
  query?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

/** Contact detail from detail API */
type ContactDetail = ContactListItem;

type ContactListMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
};

type ContactListApiResponse = {
  success?: boolean;
  data?: ContactListItem[];
  meta?: ContactListMeta;
};

type ContactDetailApiResponse = {
  success?: boolean;
  data?: ContactDetail;
};

const LIMIT = 10;

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
  } catch {
    return s;
  }
}

export default function ContactPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactListItem | null>(null);

  const { data: listResponse, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.contactList, page, LIMIT],
    queryFn: async () => {
      const res = await getAdminContactListApi({ page, limit: LIMIT });
      if (!checkResponse({ res })) {
        return {
          data: [],
          meta: { page: 1, limit: LIMIT, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        } as ContactListApiResponse;
      }
      return res.data as ContactListApiResponse;
    },
  });

  const items = useMemo(
    () => listResponse?.data ?? [],
    [listResponse?.data]
  );
  const meta = listResponse?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / LIMIT));
  const hasNext = meta?.hasNextPage ?? page < totalPages;
  const hasPrev = meta?.hasPrevPage ?? page > 1;

  const openDetail = (row: ContactListItem) => {
    setDetailId(row._id);
    setDetailModalOpen(true);
  };

  const closeDetail = () => {
    setDetailModalOpen(false);
    setDetailId(null);
  };

  const invalidateContactList = () => {
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.contactList });
  };

  const handleDelete = () => {
    const item = deleteTarget;
    setDeleteTarget(null);
    if (!item?._id) return;
    catchAsync(async () => {
      const res = await deleteAdminContactApi(item._id);
      if (checkResponse({ res, showSuccess: true })) {
        invalidateContactList();
        if (detailId === item._id) closeDetail();
      }
    })();
  };

  const columns: TableColumn<ContactListItem>[] = [
    {
      head: "Email",
      component: (row) => (
        <span className="font-mono text-xs">{row.email ?? "—"}</span>
      ),
    },
    {
      head: "Phone",
      component: (row) => (
        <span className="font-mono text-xs">{row.phone_number ?? "—"}</span>
      ),
    },
    {
      head: "Query",
      component: (row) => (
        <span className="text-rcn-muted text-xs line-clamp-1">
          {row.query ?? "—"}
        </span>
      ),
    },
    {
      head: "Date",
      component: (row) => (
        <span className="text-xs text-rcn-muted">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      head: "Actions",
      component: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => openDetail(row)}>
            View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
        <div className="mb-3">
          <h3 className="m-0 text-sm font-semibold">Contact Queries</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            View and manage contact form submissions.
          </p>
        </div>

        <TableLayout<ContactListItem>
          columns={columns}
          data={items}
          loader={isLoading}
          variant="bordered"
          size="sm"
          emptyMessage="No contact queries found."
          getRowKey={(row) => row._id}
          onRowClick={openDetail}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-rcn-border">
            <p className="text-xs text-rcn-muted mb-0">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasNext}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        type="delete"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete contact query"
        message={
          deleteTarget?.email
            ? `Are you sure you want to delete the query from ${deleteTarget.email}? This action cannot be undone.`
            : "Are you sure you want to delete this contact query? This action cannot be undone."
        }
      />

      <Modal
        isOpen={detailModalOpen}
        onClose={closeDetail}
        maxWidth="560px"
      >
        <ContactDetailModal
          contactId={detailId}
          onClose={closeDetail}
          onDelete={(id) => setDeleteTarget({ _id: id })}
        />
      </Modal>
    </>
  );
}

function ContactDetailModal({
  contactId,
  onClose,
  onDelete,
}: {
  contactId: string | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}) {
  const { data: detailData, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.contactDetail, contactId],
    queryFn: async () => {
      if (!contactId) return null;
      const res = await getAdminContactDetailApi(contactId);
      if (!checkResponse({ res })) return null;
      const body = res.data as ContactDetailApiResponse;
      const detail =
        typeof body === "object" && body && "data" in body
          ? (body as { data?: ContactDetail }).data
          : (body as unknown as ContactDetail);
      return detail ?? null;
    },
    enabled: !!contactId,
  });

  if (!contactId) return null;

  const fields = [
    { label: "Email", value: detailData?.email },
    { label: "Phone", value: detailData?.phone_number },
    { label: "Query", value: detailData?.query },
    { label: "Date", value: formatDate(detailData?.createdAt) },
  ];

  return (
    <div className="p-1">
      <div className="flex justify-between items-start gap-2 mb-4">
        <h3 className="m-0 text-sm font-semibold">Contact query details</h3>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
          ✕
        </Button>
      </div>
      {isLoading && (
        <div className="py-6 text-center">
          <span
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-rcn-border border-t-rcn-accent"
            aria-hidden
          />
          <p className="text-xs text-rcn-muted mt-2 mb-0">Loading…</p>
        </div>
      )}
      {!isLoading && detailData && (
        <>
          <dl className="space-y-3 text-sm">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-rcn-muted font-medium uppercase tracking-wide mb-0.5">
                  {label}
                </dt>
                <dd className="m-0 text-rcn-dark-bg whitespace-pre-wrap wrap-break-word">
                  {value ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
          {onDelete && contactId && (
            <div className="mt-4 pt-3 border-t border-rcn-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onDelete(contactId);
                }}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Delete query
              </Button>
            </div>
          )}
        </>
      )}
      {!isLoading && !detailData && (
        <p className="text-xs text-rcn-muted py-4">Could not load details.</p>
      )}
    </div>
  );
}
