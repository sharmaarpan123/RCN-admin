/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Shared constants and helpers used by master-admin and org-portal.
// Staff-portal, org-portal, and master-admin pages use their own mock data.

export const US_STATES = [
  "","AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT",
  "NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "2-digit" };
  return d.toLocaleDateString(undefined, opts);
};

export const escapeHtml = (str: any) => {
  return (str || "").toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
};

export const centsToMoney = (c: number) => (Math.round(c || 0) / 100).toFixed(2);

export const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
