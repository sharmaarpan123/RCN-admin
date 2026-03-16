"use client";

import {
  getOrganizationJoinRequestsApi,
  putOrganizationJoinRequestApproveApi,
  putOrganizationJoinRequestRejectApi,
} from "@/apis/ApiCalls";
import { Button, TableLayout, Modal, type TableColumn } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import defaultQueryKeys from "@/utils/orgQueryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

interface RawJoinRequest {
  _id: string;
  user_id?: {
    _id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  organization_id?: {
    _id?: string;
    name?: string;
    email?: string;
    city?: string;
    state?: string;
  };
  branch_id?: {
    _id?: string;
    name?: string;
  };
  department_id?: {
    _id?: string;
    name?: string;
  };
  status?: string;
  requested_at?: string;
  createdAt?: string;
}

interface JoinRequestRow {
  _id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  branch_id?: string;
  branch_name?: string;
  department_id?: string;
  department_name?: string;
  created_at?: string;
}

const JOIN_REQUESTS_QUERY_KEY = [...defaultQueryKeys.userList, "join-requests"];

function getDisplayName(r: { first_name?: string; last_name?: string; email?: string }) {
  const first = (r.first_name ?? "").trim();
  const last = (r.last_name ?? "").trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return (r.email ?? "").trim() || "—";
}

export default function OrgPortalJoiningApprovalsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<JoinRequestRow | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );

  const { data: joinData, isLoading } = useQuery({
    queryKey: JOIN_REQUESTS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await getOrganizationJoinRequestsApi();
        if (!checkResponse({ res })) return { data: [] };
        return res.data;
      } catch {
        return { data: [] };
      }
    },
  });
  const rawRequests: RawJoinRequest[] = joinData?.data ?? [];

  const requests: JoinRequestRow[] = useMemo(
    () =>
      rawRequests.map((r) => ({
        _id: r._id,
        email: r.user_id?.email,
        first_name: r.user_id?.first_name,
        last_name: r.user_id?.last_name,
        organization_name: r.organization_id?.name,
        branch_id: r.branch_id?._id,
        branch_name: r.branch_id?.name,
        department_id: r.department_id?._id,
        department_name: r.department_id?.name,
        created_at: r.requested_at ?? r.createdAt,
      })),
    [rawRequests],
  );

  const closeModal = () => {
    setSelected(null);
    setActionType(null);
  };

  const { isPending, mutate: handleConfirm } = useMutation({
    mutationFn: catchAsync(async () => {
      if (!selected || !actionType) return;
      const payload = {
        // backend expects `name` and `branch_id`;
        // use department_name as name and known branch_id from request
        name: selected.department_name ?? "",
        branch_id: selected.branch_id ?? "",
      };

      const res =
        actionType === "approve"
          ? await putOrganizationJoinRequestApproveApi(selected._id, payload)
          : await putOrganizationJoinRequestRejectApi(selected._id, payload);

      if (checkResponse({ res, showSuccess: true })) {
        queryClient.invalidateQueries({ queryKey: JOIN_REQUESTS_QUERY_KEY });
        closeModal();
      }
    }),
  });

  const columns: TableColumn<JoinRequestRow>[] = useMemo(
    () => [
      {
        head: "Name",
        component: (row) => (
          <span className="font-medium">{getDisplayName(row ?? {})}</span>
        ),
      },
      {
        head: "Email",
        component: (row) => (
          <span className="text-rcn-muted">{row?.email ?? "—"}</span>
        ),
      },
      {
        head: "Requested Department",
        component: (row) => (
          <span className="text-rcn-muted">
            {row?.department_name ?? "—"}
          </span>
        ),
      },
      {
        head: "Requested Branch",
        component: (row) => (
          <span className="text-rcn-muted">
            {row?.branch_name ?? "—"}
          </span>
        ),
      },
      {
        head: "Requested On",
        component: (row) =>
          row.created_at ? (
            <span className="text-rcn-muted">
              {new Date(row?.created_at ?? "").toLocaleString()}
            </span>
          ) : (
            "—"
          ),
      },
      {
        head: "Actions",
        tdClassName: "whitespace-nowrap text-left",
        component: (row) => (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelected(row);
                setActionType("approve");
              }}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelected(row);
                setActionType("reject");
              }}
            >
              Reject
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const hasRequests = requests.length > 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold m-0">Joining Approvals</h1>
          <p className="text-sm text-rcn-muted m-0 mt-0.5">
            Review and approve or reject staff join requests for your
            organization.
          </p>
        </div>
      </div>

      <div className="bg-rcn-card border border-rcn-border rounded-2xl shadow-rcn overflow-hidden">
        <div className="p-4">
          <div className="border border-rcn-border rounded-xl overflow-hidden">
            <TableLayout<JoinRequestRow>
              columns={columns}
              data={requests}
              // static table: no sort/pagination body for now
              body={{}}
              setBody={() => {}}
              emptyMessage={
                hasRequests
                  ? ""
                  : "No pending join requests right now."
              }
              loader={isLoading}
              wrapperClassName="min-w-[260px]"
              getRowKey={(row) => row._id}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selected && !!actionType}
        onClose={closeModal}
        maxWidth="380px"
      >
        <div className="w-full">
          <h3 className="font-bold text-lg m-0">
            {actionType === "approve"
              ? "Approve join request"
              : actionType === "reject"
                ? "Reject join request"
                : "Confirm"}
          </h3>
          <p className="text-sm text-rcn-muted m-0 mt-2">
            {selected
              ? `${actionType === "approve" ? "Approve" : "Reject"} "${getDisplayName(
                  selected,
                )}" for department "${selected.department_name ?? ""}" in branch "${
                  selected.branch_name ?? ""
                }".`
              : ""}
          </p>
          <div className="space-y-2 mt-4 text-sm text-rcn-muted">
            <p className="m-0">
              Branch ID:{" "}
              <span className="font-mono">{selected?.branch_id ?? "—"}</span>
            </p>
            <p className="m-0">
              Department ID:{" "}
              <span className="font-mono">{selected?.department_id ?? "—"}</span>
            </p>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={closeModal}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "reject" ? "secondary" : "primary"}
              size="sm"
              onClick={() => handleConfirm()}
              disabled={isPending}
            >
              {actionType === "approve"
                ? "Approve"
                : actionType === "reject"
                  ? "Reject"
                  : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

