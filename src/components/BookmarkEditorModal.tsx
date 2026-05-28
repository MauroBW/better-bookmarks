import React, { useEffect, useState } from "react";
import type { Section } from "../lib/types";

type BookmarkDraft = {
  label: string;
  url: string;
  icon?: string;
};

type Props = {
  open: boolean;
  title: string;
  initialValue?: BookmarkDraft;
  sectionId: string;
  sections: Section[];
  onClose: () => void;
  onSave: (value: BookmarkDraft, sectionId: string) => boolean;
};

const EMPTY_DRAFT: BookmarkDraft = {
  label: "",
  url: "",
  icon: "",
};

const BookmarkEditorModal: React.FC<Props> = ({
  open,
  title,
  initialValue,
  sectionId,
  sections,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<BookmarkDraft>(EMPTY_DRAFT);
  const [selectedSectionId, setSelectedSectionId] = useState(sectionId);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setDraft(initialValue ?? EMPTY_DRAFT);
      setSelectedSectionId(sectionId);
      setError("");
    }
  }, [open, initialValue, sectionId]);

  if (!open) return null;

  const submit = () => {
    if (!draft.label.trim()) {
      setError("Please set a name.");
      return;
    }
    const ok = onSave(draft, selectedSectionId);
    if (!ok) {
      setError("Invalid URL. Use a valid domain or full URL.");
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal w-full max-w-[360px] rounded-2xl border p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <div className="mt-4 space-y-3 text-left">
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">Title</span>
            <input
              value={draft.label}
              onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[color:var(--surface-strong)] px-3 py-2 text-sm text-text-primary"
              placeholder="React docs"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">URL</span>
            <input
              value={draft.url}
              onChange={(event) => setDraft((prev) => ({ ...prev, url: event.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[color:var(--surface-strong)] px-3 py-2 text-sm text-text-primary"
              placeholder="react.dev"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">Section</span>
            <select
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[color:var(--surface-strong)] px-3 py-2 text-sm text-text-primary"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-text-muted">
              Optional icon (emoji)
            </span>
            <input
              value={draft.icon ?? ""}
              onChange={(event) => setDraft((prev) => ({ ...prev, icon: event.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-[color:var(--surface-strong)] px-3 py-2 text-sm text-text-primary"
              placeholder="⚛️"
            />
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit}>
            {title.includes("Edit") ? "Save Changes" : "Add Bookmark"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkEditorModal;
