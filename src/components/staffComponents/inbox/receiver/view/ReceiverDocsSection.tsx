"use client";

import React from "react";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";

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
  onPayUnlock: () => void;
}

export function ReceiverDocsSection({ isUnlocked, receiverStatus, docList, onPayUnlock }: ReceiverDocsSectionProps) {
  return (
    <div id="secDocs" className={SECTION_CLASS}>
      <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
        <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">📎</span>
          Attached Documents (From Sender)
        </h4>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">{isUnlocked ? "Downloadable" : "Pay to view"}</span>
      </div>
      {isUnlocked ? (
        docList.length > 0 ? (
          <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Document</th>
                  <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Download</th>
                </tr>
              </thead>
              <tbody>
                {docList.map((d, idx) => (
                  <tr key={idx} className="border-t border-slate-200">
                    <td className="p-2.5"><strong>{d.label}</strong>{d.url ? <div className="text-rcn-muted text-xs">File: {d.url}</div> : null}</td>
                     <td className="p-2.5"><button type="button" onClick={() => alert(`Demo: download ${d.label}`)} className="border border-slate-200 bg-white px-2 py-1.5 rounded-xl text-xs font-extrabold shadow">Download</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3 text-rcn-muted text-sm">No documents attached.</div>
        )
      ) : (
        <div className="rounded-[14px] border border-dashed border-rcn-brand/35 bg-rcn-brand/5 p-4 text-center">
          <p className="m-0 text-rcn-muted text-sm font-[850]">Pay to view and download attached documents. Chat is free.</p>
          <div className="flex gap-2.5 flex-wrap justify-center mt-3">
            {receiverStatus === "ACCEPTED" && <button type="button" onClick={onPayUnlock} className="border border-rcn-brand/25 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Pay & Unlock</button>}
          </div>
        </div>
      )}
      <div className="mt-3 border border-dashed border-rcn-brand/35 rounded-[14px] bg-rcn-brand/5 p-3">
        <div className="flex justify-between gap-2.5 mb-2.5">
          <strong className="text-xs">Upload Documents</strong>
        </div>
        <div className="text-rcn-muted text-xs">All documents are downloadable after payment.</div>
      </div>
    </div>
  );
}
