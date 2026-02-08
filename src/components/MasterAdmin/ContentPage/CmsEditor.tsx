"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface CmsEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const toolbarBtnClass =
  "p-2 rounded-lg border-0 bg-transparent text-rcn-text hover:bg-rcn-border/50 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

function Toolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-rcn-border bg-[#fafafa] rounded-t-xl">
      <select
        className={`${toolbarBtnClass} text-xs font-medium min-w-28 bg-white border border-rcn-border rounded-lg py-1.5 px-2`}
        value={
          editor.isActive("heading", { level: 1 })
            ? "h1"
            : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : "p"
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) as 1 | 2 | 3 }).run();
        }}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>
      <span className="w-px h-5 bg-rcn-border mx-1" aria-hidden />
      <button
        type="button"
        className={toolbarBtnClass}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title="Bold"
      >
        <span className="font-bold text-sm">B</span>
      </button>
      <button
        type="button"
        className={toolbarBtnClass}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <span className="italic text-sm">I</span>
      </button>
      <button
        type="button"
        className={toolbarBtnClass}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <span className="line-through text-sm">S</span>
      </button>
      <span className="w-px h-5 bg-rcn-border mx-1" aria-hidden />
      <button
        type="button"
        className={toolbarBtnClass}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M4 6h2v2H4V6zm0 5h2v2H4v-2zm0 5h2v2H4v-2zm3-10h13v2H7V6zm0 5h13v2H7v-2zm0 5h13v2H7v-2z" />
        </svg>
      </button>
      <button
        type="button"
        className={toolbarBtnClass}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered list"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
        </svg>
      </button>
      <button
        type="button"
        className={toolbarBtnClass}
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        title="Inline code"
      >
        <span className="font-mono text-xs">&lt;/&gt;</span>
      </button>
    </div>
  );
}


export function CmsEditor({
  value,
  onChange,
  placeholder = "Write content here...",
  className,
  id,
}: CmsEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className={className} id={id}>
      <div
        className="rounded-xl border border-rcn-border bg-white overflow-hidden focus-within:border-[#b9d7c5] focus-within:shadow-[0_0_0_3px_rgba(31,122,75,0.12)] transition-shadow"
        data-placeholder={placeholder}
      >
        <Toolbar editor={editor} />
        <div className="px-3 py-2.5 [&_.tiptap]:min-h-[180px] [&_.tiptap]:outline-none [&_.tiptap]:text-sm [&_.tiptap_p]:my-1.5 [&_.tiptap_h1]:text-xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mt-4 [&_.tiptap_h1]:mb-2 [&_.tiptap_h2]:text-lg [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-3 [&_.tiptap_h2]:mb-1.5 [&_.tiptap_h3]:text-base [&_.tiptap_h3]:font-bold [&_.tiptap_h3]:mt-2 [&_.tiptap_h3]:mb-1 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ul]:my-2 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_ol]:my-2 [&_.tiptap_li]:my-0.5 [&_.tiptap_code]:bg-rcn-border/50 [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5 [&_.tiptap_code]:rounded [&_.tiptap_code]:text-xs [&_.tiptap_code]:font-mono">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
