"use client";

import React from "react";
import { fmtDate } from "@/app/staff-portal/inbox/helpers";
import type { Comm } from "@/app/staff-portal/inbox/types";
import { BOX_GRAD } from "@/components/staffComponents/inbox/sender/view/senderViewHelpers";

const SECTION_CLASS =
  "border border-rcn-border/60 bg-white/95 rounded-[18px] p-3.5 shadow-[0_12px_26px_rgba(2,6,23,.07)] relative overflow-hidden border-l-4 border-l-rcn-brand scroll-mt-[120px]";

interface ReceiverActivityLogSectionProps {
  comms: Comm[];
}

export function ReceiverActivityLogSection({ comms }: ReceiverActivityLogSectionProps) {
  return (
    <div id="secLog" className={SECTION_CLASS}>
      <div className="-m-3.5 -mt-3.5 mb-3 p-3 border-b border-rcn-border/60 rounded-t-[18px] flex items-center justify-between" style={{ background: BOX_GRAD }}>
        <h4 className="m-0 text-[13px] font-semibold flex items-center gap-2.5">
          <span className="w-[30px] h-[30px] rounded-xl flex items-center justify-center border border-rcn-brand/25 bg-white/70 shadow">🕒</span>
          Communication & Activity Log
        </h4>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-black border border-rcn-brand/25 bg-white/70 text-rcn-accent-dark">Audit Trail</span>
      </div>
      {comms.length > 0 ? (
        <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Time</th>
                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Who</th>
                <th className="text-left p-2.5 bg-rcn-brand/10 font-black text-[11px] uppercase">Message</th>
              </tr>
            </thead>
            <tbody>
              {[...comms].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).map((c, i) => (
                <tr key={i} className="border-t border-slate-200">
                  <td className="p-2.5">{fmtDate(c.at)}</td>
                  <td className="p-2.5"><strong>{c.who}</strong></td>
                  <td className="p-2.5">{c.msg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-rcn-muted font-black text-sm">No activity yet.</div>
      )}
    </div>
  );
}
