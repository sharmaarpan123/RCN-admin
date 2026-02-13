"use client";

import React, { useState, useRef } from "react";

interface DocUploadInlineProps {
  refId: string;
  onAdd: (refId: string, name: string, type: string, fileName: string) => void;
}

export function DocUploadInline({ refId, onAdd }: DocUploadInlineProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Other");
  const fileRef = useRef<HTMLInputElement>(null);
  const handle = () => {
    const f = fileRef.current?.files?.[0];
    const fileName = f ? f.name : "";
    if (!name.trim() && !fileName) return alert("Enter a document name or choose a file.");
    onAdd(refId, name.trim() || fileName, type, fileName);
    setName("");
    if (fileRef.current) fileRef.current.value = "";
  };
  return (
    <div className="border border-dashed border-rcn-brand/35 rounded-[14px] bg-rcn-brand/5 p-3" aria-label="Upload documents column">
      <div className="flex justify-between gap-2.5 mb-2.5">
        <strong className="text-xs">Upload Documents</strong>
        <span className="text-[11px] text-rcn-muted font-black">Sender Only</span>
      </div>
      <div className="flex flex-col gap-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Document name (e.g., Discharge Summary)" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-slate-200 bg-white rounded-xl py-2 px-2.5 text-xs font-[850] outline-none" aria-label="Document type">
          <option value="Clinical">Clinical</option>
          <option value="Medication">Medication</option>
          <option value="Wound">Wound</option>
          <option value="Insurance">Insurance</option>
          <option value="Other">Other</option>
        </select>
        <input ref={fileRef} type="file" className="text-xs" />
        <button type="button" onClick={handle} className="border border-rcn-brand/30 bg-rcn-brand/10 text-rcn-accent-dark px-2.5 py-2 rounded-xl font-extrabold text-xs shadow">Upload</button>
        <div className="text-rcn-muted text-[11px]">Demo: file isn’t stored. Replace with real upload + signed download URLs.</div>
      </div>
    </div>
  );
}
