"use client";

import { useState } from "react";
import { Button } from "@/components";
import { CmsEditor } from "./CmsEditor";
import type { AdminCmsPageItem } from "./types";
import { INPUT_CLASS } from "./types";

interface CmsPageFormProps {
  page: AdminCmsPageItem | null;
  onClose: () => void;
  onSave: (payload: { name: string; slug: string; content: string }) => void;
  isSaving?: boolean;
}

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function CmsPageForm({ page, onClose, onSave, isSaving = false }: CmsPageFormProps) {
  const [name, setName] = useState(page?.name ?? "");
  const [slug, setSlug] = useState(page?.slug ?? slugFromTitle(page?.name ?? ""));
  const [content, setContent] = useState(page?.content ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const effectiveSlug = slugManuallyEdited ? slug : slugFromTitle(name);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({
      name: trimmedName,
      slug: effectiveSlug.trim() || slugFromTitle(trimmedName),
      content,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold m-0">
          {page ? "Edit" : "New"} CMS Page
        </h3>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="h-px bg-rcn-border my-4" />
      <div className="space-y-4">
        <div>
          <label className="text-xs text-rcn-muted block mb-1.5">Title</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLASS}
            placeholder="Page title"
          />
        </div>
        <div>
          <label className="text-xs text-rcn-muted block mb-1.5">Slug (URL path)</label>
          <input
            value={effectiveSlug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            className={INPUT_CLASS}
            placeholder="e.g. about-us"
          />
        </div>
        <div>
          <label className="text-xs text-rcn-muted block mb-1.5">Content</label>
          <CmsEditor value={content} onChange={setContent} />
        </div>
      </div>
      <div className="h-px bg-rcn-border my-4" />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
