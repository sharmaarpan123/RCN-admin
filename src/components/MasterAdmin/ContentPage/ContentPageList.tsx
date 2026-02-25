"use client";

import {
  getAdminCmsListApi,
  getAdminCmsByIdApi,
  createAdminCmsApi,
  updateAdminCmsApi,
} from "@/apis/ApiCalls";
import { DebouncedInput, Modal, TableLayout } from "@/components";
import type { TableColumn } from "@/components";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CmsPageForm } from "./CmsPageForm";
import type { AdminCmsPageItem, CmsTableRow } from "./types";
import { BTN_CLASS, BTN_PRIMARY_CLASS, BTN_SMALL_CLASS, INPUT_CLASS } from "./types";

type CmsListApiResponse = {
  success?: boolean;
  data?: AdminCmsPageItem[];
  message?: string;
};

type CmsDetailApiResponse = {
  success?: boolean;
  data?: AdminCmsPageItem;
  message?: string;
};

export function ContentPageList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: listResponse, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.cmsList],
    queryFn: async () => {
      const res = await getAdminCmsListApi();
      if (!checkResponse({ res })) return { data: [] };
      return (res?.data ?? { data: [] }) as CmsListApiResponse;
    },
  });

  const list = useMemo(
    () => (listResponse?.data ?? []) as AdminCmsPageItem[],
    [listResponse]
  );

  const filteredList = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        (p.name ?? "").toLowerCase().includes(q) ||
        (p.slug ?? "").toLowerCase().includes(q) ||
        (p._id ?? "").toLowerCase().includes(q)
    );
  }, [list, search]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.cmsList });
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.cmsDetail });
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const createMutation = useMutation({
    mutationFn: catchAsync(
      async (payload: { name: string; slug: string; content: string }) => {
        const res = await createAdminCmsApi(payload);
        if (checkResponse({ res, showSuccess: true })) {
          invalidate();
          closeModal();
        }
      }
    ),
  });

  const updateMutation = useMutation({
    mutationFn: catchAsync(
      async ({
        id,
        payload,
      }: {
        id: string;
        payload: { name: string; slug: string; content: string };
      }) => {
        const res = await updateAdminCmsApi(id, payload);
        if (checkResponse({ res, showSuccess: true })) {
          invalidate();
          closeModal();
        }
      }
    ),
  });

  const { data: detailResponse } = useQuery({
    queryKey: [...defaultQueryKeys.cmsDetail, editId ?? ""],
    queryFn: async () => {
      if (!editId) return null;
      const res = await getAdminCmsByIdApi(editId);
      if (!checkResponse({ res })) return null;
      return (res?.data ?? null) as CmsDetailApiResponse | null;
    },
    enabled: !!editId && modalOpen,
  });

  const editPage = useMemo(() => {
    if (!editId) return null;
    const fromDetail = (detailResponse?.data ?? null) as AdminCmsPageItem | null;
    if (fromDetail) return fromDetail;
    return list.find((p) => p._id === editId) ?? null;
  }, [editId, detailResponse, list]);

  const handleSave = (payload: {
    name: string;
    slug: string;
    content: string;
  }) => {
    if (editId) {
      updateMutation.mutate({ id: editId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openNew = () => {
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setModalOpen(true);
  };

  const columns: TableColumn<CmsTableRow>[] = [
    {
      head: "Title",
      component: (row) => (
        <>
          <b>{row.name ?? "—"}</b>
          {row.slug ? (
            <span className="text-rcn-muted font-mono text-[11px] block mt-0.5">
              /{row.slug}
            </span>
          ) : null}
        </>
      ),
    },
    {
      head: "ID",
      component: (row) => (
        <span className="text-rcn-muted font-mono text-[11px]">{row._id}</span>
      ),
    },
    {
      head: "Updated",
      component: (row) => (
        <span className="text-xs text-rcn-muted">
          {row.updatedAt
            ? new Date(row.updatedAt).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      head: "Actions",
      component: (row) => (
        <button
          type="button"
          onClick={() => openEdit(row._id)}
          className={BTN_SMALL_CLASS}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4 mb-4">
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} maxWidth="800px">
        <CmsPageForm
          key={editPage?._id ?? "new"}
          page={editPage}
          onClose={closeModal}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </Modal>

      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h3 className="m-0 text-sm font-semibold">CMS Pages</h3>
          <p className="text-xs text-rcn-muted mt-1 mb-0">
            Add and edit content pages (e.g. About, Terms, Privacy).
          </p>
        </div>
      
      </div>

      <div className="flex flex-wrap gap-2.5 items-end mt-3">
        <div className="flex flex-col gap-1.5 min-w-[260px] flex-1">
          <label className="text-xs text-rcn-muted">Search</label>
          <DebouncedInput
            placeholder="Title, slug, or ID"
            value={search}
            onChange={(v) => setSearch(v)}
            className={INPUT_CLASS}
          />
        </div>
        <button
          type="button"
          onClick={() => setSearch("")}
          className={BTN_CLASS}
        >
          Clear
        </button>
      </div>

      <div className="overflow-auto mt-3">
        <TableLayout<CmsTableRow>
          columns={columns}
          data={filteredList}
          loader={isLoading}
          variant="bordered"
          size="sm"
          emptyMessage="No CMS pages yet. Create one to get started."
          getRowKey={(row) => row._id}
        />
      </div>
    </div>
  );
}
