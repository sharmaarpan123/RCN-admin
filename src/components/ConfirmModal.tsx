"use client";

import React from "react";
import Button from "./Button";
import Modal from "./Modal";

export type ConfirmModalType = "logout" | "delete";

const CONFIRM_CONFIG: Record<
  ConfirmModalType,
  { title: string; message: string; confirmLabel: string; confirmVariant: "primary" | "danger" }
> = {
  logout: {
    title: "Logout",
    message: "Are you sure you want to logout?",
    confirmLabel: "Logout",
    confirmVariant: "primary",
  },
  delete: {
    title: "Delete",
    message: "Are you sure you want to delete?",
    confirmLabel: "Delete",
    confirmVariant: "danger",
  },
};

interface ConfirmModalProps {
  type: ConfirmModalType;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Optional override for title */
  title?: string;
  /** Optional override for message */
  message?: string;
  /** Optional override for confirm button label */
  confirmLabel?: string;
  /** Optional disable confirm button (e.g. while submitting) */
  confirmDisabled?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  type,
  isOpen,
  onClose,
  onConfirm,
  title: titleOverride,
  message: messageOverride,
  confirmLabel: confirmLabelOverride,
  confirmDisabled = false,
}) => {
  const config = CONFIRM_CONFIG[type];
  const title = titleOverride ?? config.title;
  const message = messageOverride ?? config.message;
  const confirmLabel = confirmLabelOverride ?? config.confirmLabel;
  const confirmVariant = config.confirmVariant;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="380px">
      <div className="p-2 w-full">
        <h3 className="font-bold text-lg m-0">{title}</h3>
        <p className="text-sm text-rcn-muted m-0 mt-2">{message}</p>
        <div className="flex gap-2 mt-5 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={confirmDisabled}>
            Cancel
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
