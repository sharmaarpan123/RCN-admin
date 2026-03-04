"use client";

import { ForwardModal } from "@/components/staffComponents/ForwardModal";

interface SenderDetailModalsProps {
  forwardOpen: boolean;
  onCloseForward: () => void;
  forwardRefId: string | null;
  onForward: (departmentIds: string[]) => void;
  isForwardPending?: boolean;
}

export function SenderDetailModals({
  forwardOpen,
  onCloseForward,
  forwardRefId,
  onForward,
  isForwardPending = false,
}: SenderDetailModalsProps) {
  return (
    <ForwardModal
      isOpen={forwardOpen}
      onClose={onCloseForward}
      refId={forwardRefId}
      onForward={onForward}
      isPending={isForwardPending}
    />
  );
}
