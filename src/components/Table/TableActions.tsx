"use client";

import React from "react";
import { Button, CustomNextLink } from "@/components";

export interface TableActionsProps {
  /** Edit page URL */
  editUrl?: string;
  /** View page URL */
  viewLink?: string;
  /** Text for view button when using viewButtonText (optional; otherwise shows view icon) */
  viewButtonText?: string;
  /** Callback to open delete confirmation */
  setDeleteModel?: () => void;
  /** Block/unblock handler (e.g. toggle user active) */
  blockUnBlockHandler?: () => void;
  /** Whether item is currently blocked */
  isBlocked?: boolean;
  /** Extra class for the actions wrapper */
  className?: string;
}

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 19 19" fill="none" aria-hidden>
    <g clipPath="url(#clip0_edit)">
      <path
        d="M3.36751 15.785C3.54751 15.785 3.58351 15.767 3.74551 15.731L6.98551 15.083C7.32751 14.993 7.66951 14.831 7.93951 14.561L15.7875 6.71301C16.9935 5.50701 16.9935 3.43701 15.7875 2.23101L15.1215 1.52901C13.9155 0.323012 11.8275 0.323012 10.6215 1.52901L2.77351 9.39501C2.52151 9.64701 2.34151 10.007 2.25151 10.349L1.56751 13.625C1.47751 14.237 1.65751 14.831 2.08951 15.263C2.43151 15.605 2.93551 15.785 3.36751 15.785ZM3.97951 10.691L11.8275 2.82501C12.3495 2.30301 13.3035 2.30301 13.8075 2.82501L14.4915 3.50901C15.1035 4.12101 15.1035 4.98501 14.4915 5.57901L6.66151 13.445L3.33151 14.003L3.97951 10.691ZM15.7155 16.901H2.43151C1.90951 16.901 1.56751 17.243 1.56751 17.765C1.56751 18.287 1.99951 18.629 2.43151 18.629H15.6435C16.1655 18.629 16.5975 18.287 16.5975 17.765C16.5795 17.243 16.1475 16.901 15.7155 16.901Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.3"
      />
    </g>
    <defs>
      <clipPath id="clip0_edit">
        <rect width="18" height="18" fill="white" transform="translate(0.127 0.629)" />
      </clipPath>
    </defs>
  </svg>
);

const ViewIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="12" viewBox="0 0 21 13" fill="none" aria-hidden>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.1269 0.379883C6.00023 0.379883 2.81476 3.30125 1.26883 5.0114C0.614598 5.73509 0.23969 6.2714 0.23969 6.2714C0.0900251 6.48573 0.0900251 6.77233 0.23969 6.98666C0.23969 6.98666 0.534721 7.40936 1.05152 8.0024C2.50253 9.6674 5.79632 12.8782 10.1269 12.8782C14.572 12.8782 17.9291 9.49839 19.3181 7.87307C19.7642 7.35098 20.0152 6.98666 20.0152 6.98666C20.1649 6.77233 20.1649 6.48573 20.0152 6.2714C20.0152 6.2714 19.7398 5.87467 19.2535 5.31173C17.8276 3.6621 14.5055 0.379883 10.1269 0.379883ZM10.1269 1.62996C13.8634 1.62996 16.9827 4.59581 18.3074 6.12852C18.5725 6.43529 18.5974 6.48424 18.7089 6.63143C18.605 6.76803 18.593 6.79697 18.3671 7.06124C17.0781 8.56964 13.9201 11.6281 10.1269 11.6281C6.43137 11.6281 3.34181 8.72873 1.99268 7.18081C1.70294 6.8484 1.67185 6.78672 1.55443 6.63143C1.69037 6.45001 1.77636 6.31473 2.19543 5.85135C3.63536 4.25828 6.60534 1.62996 10.1269 1.62996ZM10.1269 4.13127C11.5152 4.13127 12.6282 5.23814 12.6282 6.62663C12.6282 8.01496 11.5152 9.12794 10.1269 9.12794C8.73837 9.12794 7.6315 8.01496 7.6315 6.62663C7.6315 5.23814 8.73837 4.13127 10.1269 4.13127Z"
      fill="currentColor"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19" fill="none" aria-hidden>
    <g clipPath="url(#clip0_del)">
      <path
        d="M10.3149 14.4727C10.4807 14.4727 10.6397 14.4068 10.7569 14.2896C10.8741 14.1724 10.9399 14.0134 10.9399 13.8477V7.59766C10.9399 7.4319 10.8741 7.27292 10.7569 7.15571C10.6397 7.0385 10.4807 6.97266 10.3149 6.97266C10.1492 6.97266 9.99021 7.0385 9.873 7.15571C9.75579 7.27292 9.68994 7.4319 9.68994 7.59766V13.8477C9.68994 14.0134 9.75579 14.1724 9.873 14.2896C9.99021 14.4068 10.1492 14.4727 10.3149 14.4727ZM5.93994 14.4727C6.1057 14.4727 6.26467 14.4068 6.38188 14.2896C6.49909 14.1724 6.56494 14.0134 6.56494 13.8477V7.59766C6.56494 7.4319 6.49909 7.27292 6.38188 7.15571C6.26467 7.0385 6.1057 6.97266 5.93994 6.97266C5.77418 6.97266 5.61521 7.0385 5.498 7.15571C5.38079 7.27292 5.31494 7.4319 5.31494 7.59766V13.8477C5.31494 14.0134 5.38079 14.1724 5.498 14.2896C5.61521 14.4068 5.77418 14.4727 5.93994 14.4727ZM10.6274 2.28516C10.7932 2.28516 10.9522 2.21931 11.0694 2.1021C11.1866 1.98489 11.2524 1.82592 11.2524 1.66016C11.2524 1.4944 11.1866 1.33542 11.0694 1.21821C10.9522 1.101 10.7932 1.03516 10.6274 1.03516H5.62744C5.46168 1.03516 5.30271 1.101 5.1855 1.21821C5.06829 1.33542 5.00244 1.4944 5.00244 1.66016C5.00244 1.82592 5.06829 1.98489 5.1855 2.1021C5.30271 2.21931 5.46168 2.28516 5.62744 2.28516H10.6274Z"
        fill="#EB5757"
      />
      <path
        d="M1.25244 2.91016C1.08668 2.91016 0.92771 2.976 0.8105 3.09321C0.69329 3.21042 0.627441 3.3694 0.627441 3.53516C0.627441 3.70092 0.69329 3.85989 0.8105 3.9771C0.92771 4.09431 1.08668 4.16016 1.25244 4.16016H1.87744V15.6602C1.87744 17.0727 3.02744 18.2227 4.43994 18.2227H11.8149C13.2274 18.2227 14.3774 17.0727 14.3774 15.6602V4.16016H15.0024C15.1682 4.16016 15.3272 4.09431 15.4444 3.9771C15.5616 3.85989 15.6274 3.70092 15.6274 3.53516C15.6274 3.3694 15.5616 3.21042 15.4444 3.09321C15.3272 2.976 15.1682 2.91016 15.0024 2.91016H2.50244H1.25244ZM13.1274 4.16016V15.6602C13.1274 16.0083 12.9892 16.3421 12.743 16.5882C12.4969 16.8344 12.163 16.9727 11.8149 16.9727H4.43994C4.09185 16.9727 3.75801 16.8344 3.51186 16.5882C3.26572 16.3421 3.12744 16.0083 3.12744 15.6602V4.16016H13.1274Z"
        fill="#EB5757"
      />
    </g>
    <defs>
      <clipPath id="clip0_del">
        <rect width="16" height="18" fill="white" transform="translate(0.127 0.629)" />
      </clipPath>
    </defs>
  </svg>
);

const BlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const UnblockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M8 11V7C8 5.34315 9.34315 4 11 4C12.6569 4 14 5.34315 14 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 16L11.5 17.5L14 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function TableActions({
  editUrl,
  viewLink,
  viewButtonText,
  setDeleteModel,
  blockUnBlockHandler,
  isBlocked,
  className = "",
}: TableActionsProps) {
  return (
    <div className={`flex items-center gap-2 flex-wrap whitespace-nowrap ${className}`.trim()}>
      {editUrl && (
        <CustomNextLink href={editUrl} variant="secondary" size="sm" className="inline-flex items-center gap-1 text-rcn-text hover:text-rcn-accent" title="Edit">
          <EditIcon />
          <span className="sr-only">Edit</span>
        </CustomNextLink>
      )}

      {viewLink && (
        viewButtonText ? (
          <CustomNextLink href={viewLink} variant="secondary" size="sm">
            {viewButtonText}
          </CustomNextLink>
        ) : (
          <CustomNextLink href={viewLink} variant="secondary" size="sm" className="inline-flex items-center gap-1 text-rcn-muted hover:text-rcn-accent" title="View">
            <ViewIcon />
            <span className="sr-only">View</span>
          </CustomNextLink>
        )
      )}

      {blockUnBlockHandler && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            blockUnBlockHandler();
          }}
          className="inline-flex items-center justify-center p-1 rounded border-0 bg-transparent cursor-pointer text-rcn-muted hover:text-rcn-accent focus:outline-none focus:ring-2 focus:ring-rcn-accent/30"
          title={isBlocked ? "Unblock" : "Block"}
          aria-label={isBlocked ? "Unblock" : "Block"}
        >
          {isBlocked ? (
            <span className="text-rcn-danger"><BlockIcon /></span>
          ) : (
            <span className="text-rcn-accent"><UnblockIcon /></span>
          )}
        </button>
      )}

      {setDeleteModel && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteModel();
          }}
          className="p-1 min-w-0 text-rcn-danger hover:bg-rcn-danger/10 border-0"
          title="Delete"
          aria-label="Delete"
        >
          <DeleteIcon />
        </Button>
      )}
    </div>
  );
}

export default TableActions;
