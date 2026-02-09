"use client";

import {
  createAdminUserApi,
  deleteAdminUserApi,
  getAdminUserByIdApi,
  getAdminRolesApi,
  getAdminUsersApi,
  updateAdminUserApi,
} from "@/apis/ApiCalls";
import {
  Button,
  ConfirmModal,
  DebouncedInput,
  Modal,
  PhoneInputField,
  TableLayout,
} from "@/components";
import type { TableColumn } from "@/components";
import defaultQueryKeys from "@/utils/adminQueryKeys";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import type { AdminUser } from "./types";
import { INPUT_CLASS } from "./types";

type UsersApiResponse = { success?: boolean; data?: AdminUser[]; message?: string };
type RolesApiResponse = { success?: boolean; data?: { id?: number; _id?: string; name?: string }[] };

const safeLower = (s: unknown) => (s ?? "").toString().toLowerCase();

export default function SystemAccessPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: defaultQueryKeys.adminUsersList,
    queryFn: async () => {
      const res = await getAdminUsersApi();
      if (!checkResponse({ res })) return { data: [] } as UsersApiResponse;
      return (res?.data ?? { data: [] }) as UsersApiResponse;
    },
  });

  const { data: rolesResponse } = useQuery({
    queryKey: defaultQueryKeys.rolesList,
    queryFn: async () => {
      const res = await getAdminRolesApi();
      if (!checkResponse({ res })) return { data: [] } as RolesApiResponse;
      return (res?.data ?? { data: [] }) as RolesApiResponse;
    },
  });

  const users = useMemo(() => (usersResponse?.data ?? []) as AdminUser[], [usersResponse]);
  const roles = useMemo(
    () => (rolesResponse?.data ?? []) as { id?: number; name?: string }[],
    [rolesResponse]
  );

  const filtered = useMemo(() => {
    const searchLower = safeLower(search);
    return users.filter((u) => {
      const hay = [
        u.first_name,
        u.last_name,
        u.email,
        u.dial_code,
        u.phone_number,
      ]
        .map(safeLower)
        .join(" ");
      const okSearch = !search.trim() || hay.includes(searchLower);
      const okStatus =
        !statusFilter ||
        String(u.status) === statusFilter;
      return okSearch && okStatus;
    });
  }, [users, search, statusFilter]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: defaultQueryKeys.adminUsersList });
  };

  const openNew = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditUser(null);
  };

  const handleDelete = () => {
    const user = deleteTarget;
    setDeleteTarget(null);
    if (!user?._id) return;
    catchAsync(async () => {
      const res = await deleteAdminUserApi(user._id);
      if (checkResponse({ res, showSuccess: true })) invalidate();
    })();
  };

  const getRoleName = (u: AdminUser) =>
    u.role?.name ?? (roles.find((r) => r.id === u.role_id)?.name ?? String(u.role_id ?? "—"));

  const columns: TableColumn<AdminUser>[] = [
    {
      head: "Name",
      component: (u) => (
        <>
          <b>{(u.first_name ?? "") + " " + (u.last_name ?? "")}</b>
          <div className="text-rcn-muted text-xs">{u.email ?? "—"}</div>
        </>
      ),
    },
    { head: "Email", component: (u) => <span className="font-mono text-xs">{u.email ?? "—"}</span> },
    {
      head: "Phone",
      component: (u) => (
        <span className="font-mono text-xs">
          {[u.dial_code, u.phone_number].filter(Boolean).join(" ") || "—"}
        </span>
      ),
    },
    { head: "Role", component: (u) => getRoleName(u) },
    {
      head: "Status",
      component: (u) =>
        u.status === 1 ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#b9e2c8] bg-[#f1fbf5] text-[#0b5d36]">
            Enabled
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border-[#f3b8b8] bg-[#fff1f2] text-[#991b1b]">
            Disabled
          </span>
        ),
    },
    {
      head: "Actions",
      component: (u) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(u)}>
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeleteTarget(u)}
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
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h3 className="m-0 text-sm font-semibold">Master Admin Users</h3>
            <p className="text-xs text-rcn-muted mt-1 mb-0">
              Master Admin users belong only to this Admin Panel and have no affiliation with any organization.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>
            + New Master Admin User
          </Button>
        </div>

        <div className="flex flex-wrap gap-2.5 items-end mt-3">
          <div className="flex flex-col gap-1.5 min-w-[280px] flex-1">
            <label className="text-xs text-rcn-muted">Search</label>
            <DebouncedInput
              placeholder="Name, email, phone..."
              value={search}
              onChange={setSearch}
              className={INPUT_CLASS}
              aria-label="Search master admin users"
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-xs text-rcn-muted">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">All</option>
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
          >
            Clear
          </Button>
        </div>

        <div className="mt-3">
          {usersLoading && (
            <p className="text-xs text-rcn-muted mb-2">Loading users…</p>
          )}
          <TableLayout<AdminUser>
            columns={columns}
            data={filtered}
            loader={usersLoading}
            variant="bordered"
            size="sm"
            emptyMessage="No master admin users found."
            getRowKey={(row) => row._id}
          />
        </div>

        <p className="text-xs text-rcn-muted mt-2.5 mb-0">
          Organization users are managed under <b>Organizations → Organization Modules → Users</b>.
        </p>
      </div>

      <ConfirmModal
        type="delete"
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete user"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${[deleteTarget.first_name, deleteTarget.last_name].filter(Boolean).join(" ") || deleteTarget.email}? This action cannot be undone.`
            : "Are you sure you want to delete this user?"
        }
      />

      <Modal isOpen={modalOpen} onClose={closeModal} maxWidth="560px">
        <SystemAccessUserForm
          key={editUser?._id ?? "new"}
          userId={editUser?._id ?? null}
          roles={roles}
          onClose={closeModal}
          onSuccess={() => {
            invalidate();
            closeModal();
          }}
        />
      </Modal>
    </>
  );
}

/** Form values for create/edit master admin user */
const adminUserFormSchema = yup.object({
  first_name: yup.string().trim().required("First name is required."),
  last_name: yup.string().trim().required("Last name is required."),
  email: yup
    .string()
    .trim()
    .required("Email is required.")
    .email("Please enter a valid email."),
  dial_code: yup.string().trim().optional().default(""),
  phone_number: yup.string().trim().optional().default(""),
  role_id: yup.number().required("Role is required."),
  status: yup.number().oneOf([0, 1]).required().default(1),
  password: yup.string().trim().default(""),
});

export type AdminUserFormValues = yup.InferType<typeof adminUserFormSchema>;

const defaultFormValues: AdminUserFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  dial_code: "",
  phone_number: "",
  role_id: 0,
  status: 1,
  password: "",
};

/** Form for create (password required) and edit (fetched by id, status, no password). */
function SystemAccessUserForm({
  userId,
  roles,
  onClose,
  onSuccess,
}: {
  userId: string | null;
  roles: { id?: number; name?: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!userId;

  const { data: apiUser, isLoading } = useQuery({
    queryKey: [...defaultQueryKeys.adminUserDetail, userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await getAdminUserByIdApi(userId);
      if (!checkResponse({ res })) return null;
      const body = res.data as { success?: boolean; data?: AdminUser } | AdminUser;
      const user = typeof body === "object" && body && "data" in body ? (body as { data?: AdminUser }).data : (body as AdminUser);
      return user ?? null;
    },
    enabled: !!userId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<AdminUserFormValues>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(adminUserFormSchema),
    values: apiUser
      ? {
          ...defaultFormValues,
          first_name: apiUser.first_name ?? "",
          last_name: apiUser.last_name ?? "",
          email: apiUser.email ?? "",
          dial_code: apiUser.dial_code ?? "",
          phone_number: apiUser.phone_number ?? "",
          role_id: apiUser.role_id ?? roles[0]?.id ?? 0,
          status: apiUser.status ?? 1,
        }
      : { ...defaultFormValues, role_id: roles[0]?.id ?? 0 },
  });

  const dialCode = watch("dial_code");
  const phoneNumber = watch("phone_number");
  const phoneValue = (dialCode ?? "") + (phoneNumber ?? "").replace(/\D/g, "");

  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    const code = String(country?.dialCode ?? "1");
    setValue("dial_code", code, { shouldValidate: true });
    setValue("phone_number", value.slice(code.length) || "", { shouldValidate: true });
  };

  const createMutation = useMutation({
    mutationFn: catchAsync(async (data: AdminUserFormValues) => {
      const res = await createAdminUserApi({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number || undefined,
        dial_code: data.dial_code || undefined,
        password: (data.password ?? "").trim(),
        role_id: data.role_id,
      });
      if (checkResponse({ res, showSuccess: true })) onSuccess();
    }),
  });

  const updateMutation = useMutation({
    mutationFn: catchAsync(async (data: AdminUserFormValues) => {
      if (!userId) return;
      const res = await updateAdminUserApi(userId, {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number || undefined,
        dial_code: data.dial_code || undefined,
        status: data.status,
        role_id: data.role_id,
      });
      if (checkResponse({ res, showSuccess: true })) onSuccess();
    }),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const onSave = (data: AdminUserFormValues) => {
    if (!isEdit) {
      const pwd = (data.password ?? "").trim();
      if (pwd.length < 8) {
        setError("password", { message: "Password is required (min 8 characters)." });
        return;
      }
    }
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold m-0">
          {isEdit ? "Edit" : "New"} Master Admin User
        </h3>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="h-px bg-rcn-border my-4" />
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        {isEdit && isLoading && (
          <p className="text-xs text-rcn-muted mb-2">Loading user…</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-rcn-muted font-semibold block mb-1.5">First Name</label>
            <input {...register("first_name")} className={INPUT_CLASS} />
            {errors.first_name && (
              <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-rcn-muted font-semibold block mb-1.5">Last Name</label>
            <input {...register("last_name")} className={INPUT_CLASS} />
            {errors.last_name && (
              <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>
        <div>
          <label className="text-xs text-rcn-muted font-semibold block mb-1.5">Email</label>
          <input {...register("email")} type="email" className={INPUT_CLASS} />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-rcn-muted font-semibold block mb-1.5">Phone (optional)</label>
          <PhoneInputField
            value={phoneValue}
            onChange={handlePhoneChange}
            hasError={!!errors.phone_number}
            placeholder="(optional)"
          />
          {errors.phone_number && (
            <p className="text-xs text-red-600 mt-1">{errors.phone_number.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs text-rcn-muted font-semibold block mb-1.5">Role</label>
          <select {...register("role_id", { setValueAs: (v) => Number(v) })} className={INPUT_CLASS}>
            {roles.map((r) => (
              <option key={r.id ?? r.name} value={r.id ?? 0}>
                {r.name ?? `Role ${r.id}`}
              </option>
            ))}
            {roles.length === 0 && <option value={0}>— No roles —</option>}
          </select>
          {errors.role_id && (
            <p className="text-xs text-red-600 mt-1">{errors.role_id.message}</p>
          )}
        </div>
        {!isEdit && (
          <div>
            <label className="text-xs text-rcn-muted font-semibold block mb-1.5">Password</label>
            <input
              {...register("password")}
              type="password"
              className={INPUT_CLASS}
              placeholder="Min 8 characters"
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>
        )}
        {isEdit && (
          <div>
            <label className="text-xs text-rcn-muted font-semibold block mb-1.5">Status</label>
            <select {...register("status", { setValueAs: (v) => Number(v) })} className={INPUT_CLASS}>
              <option value={1}>Enabled</option>
              <option value={0}>Disabled</option>
            </select>
          </div>
        )}
        <div className="h-px bg-rcn-border my-4" />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaving || (isEdit && isLoading)}
          >
            {isSaving ? "Saving…" : isEdit && isLoading ? "Loading…" : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
