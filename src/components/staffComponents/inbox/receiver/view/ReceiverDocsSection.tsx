"use client";

import React, { useState } from "react";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";
import { toastError } from "@/utils/toast";
import Button from "@/components/Button";
import { PreviewFile } from "@/components/PreviewFile";
import { department_status_type } from "@/app/staff-portal/inbox/receiver/[id]/page";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

interface DocItem {
  label: string;
  url: string;
}

interface ReceiverDocsSectionProps {
  isUnlocked: boolean;
  receiverStatus: string;
  docList: DocItem[];
  senderPaid: boolean;
  department_status: department_status_type;
  onAccept: () => void;
  onReject: () => void;
  onPayUnlock: () => void;
}

export function ReceiverDocsSection({
  isUnlocked,
  senderPaid,
  docList,
  department_status,
  onAccept,
  onPayUnlock,
  onReject,
}: ReceiverDocsSectionProps) {
  const [downloadingDoc, setDownloadingDoc] = useState<Record<string, boolean>>(
    {},
  );
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  const downloadDoc = async (url: string, key: string) => {
    setDownloadingDoc((p) => ({ ...p, [key]: true }));
    const res = await fetch("/api/download?url=" + url);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = url.split("/").pop() ?? "downloaded-file";
      a.click();
      setDownloadingDoc((p) => ({ ...p, [key]: false }));
    } else {
      setDownloadingDoc((p) => ({ ...p, [key]: false }));

      toastError("Failed to download document");
    }
  };
  return (
    <>
      <PreviewFile
        url={previewDocUrl ?? ""}
        isOpen={!!previewDocUrl}
        onClose={() => setPreviewDocUrl(null)}
      />
      <div id="secDocs" className={SECTION_CLASS}>
        <div
          className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between"
          style={{ background: BOX_GRAD }}
        >
          <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
            <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">
              📎
            </span>
            Attached Documents (From Sender)
          </h4>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">
              {isUnlocked ? "Downloadable" : "Pay to view"}
            </span>
          </div>
        </div>
        {docList.length > 0 ? (
          <div className="overflow-hidden relative rounded-[14px] border border-slate-200 bg-white">
            <div className="absolute inset-0 rounded-[18px] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-[520px] rounded-2xl bg-white/95 border border-slate-200 shadow-[0_20px_50px_rgba(2,6,23,.25)] p-3.5">
                <h5 className="m-0 text-[13px] font-semibold">
                  Locked: Attached Documents
                </h5>
                <p className="m-0 mt-1.5 mb-3 text-rcn-muted text-xs font-semibold">
                  Pay to view or download documents.
                </p>
                {!senderPaid && department_status?.status !== "rejected" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onPayUnlock}
                  >
                    Pay & Unlock
                  </Button>
                )}
                {senderPaid && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={onAccept}
                  >
                    Accept (sender already paid)
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={department_status?.status == "rejected"}
                  onClick={onReject}
                  className="border border-red-200 bg-red-50 text-red-700"
                >
                  {department_status?.status == "rejected"
                    ? "Rejected"
                    : "Reject"}
                </Button>
              </div>
            </div>

            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">
                    Document
                  </th>
                  <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">
                    Download
                  </th>
                </tr>
              </thead>
              <tbody>
                {docList.map((d, idx) => (
                  <tr key={idx} className="border-t border-slate-200">
                    <td className="p-2.5">
                      <strong>{d.label}</strong>
                    </td>
                    <td className="p-2.5 flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setPreviewDocUrl(d.url)}
                        className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl text-xs font-extrabold shadow"
                      >
                        View document
                      </Button>
                      <Button
                        type="button"
                        onClick={() => downloadDoc(d.url, d.label)}
                        className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2 py-1.5 rounded-xl text-xs font-extrabold shadow"
                      >
                        {downloadingDoc[d.label] ? (
                          <span className="animate-spin">🔄</span>
                        ) : (
                          "Download"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3 text-rcn-muted text-sm">
            No documents attached.
          </div>
        )}
      </div>
    </>
  );
}
