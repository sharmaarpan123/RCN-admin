"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";

export interface PreviewFileProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  fileType?: "image" | "video"
}

function PreviewImageWithLoader({ url }: { url: string }) {
  const [imageLoading, setImageLoading] = useState(true);
  return (
    <div className="relative h-full w-full flex-1 rounded border-0">
      {imageLoading && (
        <div className="absolute inset-0 z-1 flex items-center justify-center bg-slate-100/80 rounded">
          <span
            className="h-10 w-10 border-2 border-rcn-brand border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
        </div>
      )}
      <Image
        src={url}
        alt="File preview"
        className="h-full w-full flex-1 rounded border-0 object-contain"
        fill
        onLoad={() => setImageLoading(false)}
        onError={() => setImageLoading(false)}
      />
    </div>
  );
}

export function PreviewFile({ url, isOpen, onClose, fileType = "image" }: PreviewFileProps) {
  const isImage = fileType === "image";
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="70vw" locked={false}>
      <div className="relative -m-4 flex h-[88vh] min-h-[400px] w-full flex-col">
        <div
          
          onClick={onClose}
          className="absolute cursor-pointer right-2 bg-rcn-accent top-2 z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/6 text-slate-600 hover:bg-black/12 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-rcn-brand"
          aria-label="Close preview"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg> 
        </div>
        {
          isImage ? (
            <PreviewImageWithLoader key={url} url={url} />
          ) : (
            <iframe
              src={url}
              title="File preview"
              className="h-full w-full flex-1 rounded border-0"
            />)}
      </div>
    </Modal>
  );
}
