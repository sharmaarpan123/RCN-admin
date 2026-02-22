"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Button,
  ConfirmModal,
  Modal,
  TableLayout,
  type TableColumn,
} from "@/components";
import {
  createAdminSpecialityApi,
  deleteAdminSpecialityApi,
  getAdminSpecialitiesApi,
  getAdminSpecialityByIdApi,
  updateAdminSpecialityApi,
} from "@/apis/ApiCalls";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";

type AdminSpeciality = {
  user_id?: {
    first_name: string;
    last_name: string;
  } | null;
  _id?: string;
  id?: string;
  name?: string;

  status?: number;
  created_at?: string;
  updated_at?: string;
};

type SpecialitiesApiResponse = { success?: boolean; data?: AdminSpeciality[] };
type SpecialityDetailApiResponse = { success?: boolean; data?: AdminSpeciality };

const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

const specialityFormSchema = yup.object({
  name: yup.string().trim().required("Service name is required.").max(40, "Service name must be less than 40 characters."),
});

type SpecialityFormValues = yup.InferType<typeof specialityFormSchema>;

const defaultFormValues: SpecialityFormValues = {
  name: "",
};

const getSpecialityId = (s: AdminSpeciality) => s._id ?? s.id ?? "";

export default function ServicesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSpeciality | null>(null);

  const { data: listResponse, isLoading } = useQuery({
    queryKey: defaultQueryKeys.specialitiesList,
    queryFn: async () => {
      const res = await getAdminSpecialitiesApi();
      if (!checkResponse({ res })) return { data: [] } as SpecialitiesApiResponse;
      return (res.data ?? { data: [] }) as SpecialitiesApiResponse;
    },
  });

  const specialities = useMemo(
    () => (listResponse?.data ?? []) as AdminSpeciality[],
    [listResponse]
  );

  const filtered = useMemo(() => {
    const searchLower = safeLower(search);
    if (!searchLower) return specialities;
    return specialities.filter((s) => safeLower(s.name).includes(searchLower));
  }, [specialities, search]);

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.specialitiesList });

  const openNew = () => {
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (s: AdminSpeciality) => {
    setEditingId(getSpecialityId(s));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const deleteMutation = useMutation({
    mutationFn: catchAsync(async (id: string) => {
      const res = await deleteAdminSpecialityApi(id);
      if (checkResponse({ res, showSuccess: true })) {
        invalidateList();
      }
    }),
    onSuccess: () => {
      setDeleteTarget(null);
    },
  });

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const id = getSpecialityId(deleteTarget);
    if (!id) return;
    deleteMutation.mutate(id);
  };

  const columns: TableColumn<AdminSpeciality>[] = [
    {
      head: "Service Name",
      component: (s) => <span className="font-medium text-sm">{s.name ?? "—"}</span>,
    },
    {
      head: "Created By",
      component: (s) => (<span className="text-xs text-rcn-muted">
        {s?.user_id?.first_name ? (s?.user_id?.first_name ?? "") + " " + (s?.user_id?.last_name ?? "") : "By Admin"}
      </span>
      )
    },
    {
      head: "Actions",
      component: (s) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            onClick={() => setDeleteTarget(s)}
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
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Services</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">
              Manage service  available in the system.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>
            + New Service
          </Button>
        </div>

        <div className="flex flex-wrap gap-2.5 items-end mt-3">
          <div className="flex flex-col gap-1.5 min-w-[260px] flex-1">
            <label className="text-xs text-rcn-muted">Search</label>
            <input
              placeholder="Service name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSearch("")}
          >
            Clear
          </Button>
        </div>

        <div className="mt-3">
          {isLoading && (
            <p className="text-xs text-rcn-muted mb-2">Loading services…</p>
          )}
          <TableLayout<AdminSpeciality>
            columns={columns}
            data={filtered}
            loader={isLoading}
            variant="bordered"
            size="sm"
            emptyMessage="No services found."
            getRowKey={(row) => getSpecialityId(row)}
          />
        </div>
      </div>

      <ConfirmModal
        type="delete"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete service"
        message={
          deleteTarget
            ? `Delete service "${deleteTarget.name}"? This action cannot be undone.`
            : "Delete this service? This action cannot be undone."
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        maxWidth="480px"
      >
        <ServiceForm
          serviceId={editingId}
          onClose={closeModal}
          onSuccess={() => {
            invalidateList();
            closeModal();
          }}
        />
      </Modal>
    </>
  );
}

function ServiceForm({
  serviceId,
  onClose,
  onSuccess,
}: {
  serviceId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!serviceId;

  const { data: detailResponse, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.specialityDetail, serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const res = await getAdminSpecialityByIdApi(serviceId);
      if (!checkResponse({ res })) return null;
      const body = res.data as SpecialityDetailApiResponse | AdminSpeciality;
      const item =
        typeof body === "object" && body && "data" in body
          ? (body as SpecialityDetailApiResponse).data
          : (body as AdminSpeciality);
      return item ?? null;
    },
    enabled: !!serviceId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SpecialityFormValues>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(specialityFormSchema),
    values: detailResponse
      ? {
        ...defaultFormValues,
        name: detailResponse.name ?? "",
      }
      : defaultFormValues,
  });

  const createMutation = useMutation({
    mutationFn: catchAsync(async (data: SpecialityFormValues) => {
      const res = await createAdminSpecialityApi({
        name: data.name.trim(),
        user_id: "",
      });
      if (checkResponse({ res, showSuccess: true })) onSuccess();
    }),
  });

  const updateMutation = useMutation({
    mutationFn: catchAsync(async (data: SpecialityFormValues) => {
      if (!serviceId) return;
      const res = await updateAdminSpecialityApi(serviceId, {
        name: data.name.trim(),
        user_id: "",
      });
      if (checkResponse({ res, showSuccess: true })) onSuccess();
    }),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const onSave = (data: SpecialityFormValues) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        Loading...      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold m-0">
          {isEdit ? "Edit Service" : "New Service"}
        </h3>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="h-px bg-rcn-border my-4" />
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        {isEdit && isLoading && (
          <p className="text-xs text-rcn-muted mb-2">Loading service…</p>
        )}
        <div>
          <label className="text-xs text-rcn-muted font-semibold block mb-1.5">
            Service Name
          </label>
          <input
            {...register("name")}
            className={INPUT_CLASS}
            placeholder="e.g. Cardiology"
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="h-px bg-rcn-border my-4" />
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaving || (isEdit && isLoading)}
          >
            {isSaving
              ? "Saving…"
              : isEdit && isLoading
                ? "Loading…"
                : isEdit
                  ? "Update"
                  : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}

