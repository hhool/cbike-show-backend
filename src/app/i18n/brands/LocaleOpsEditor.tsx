"use client";

import { useMemo, useState } from "react";

type LocaleOpsEntry = {
  id: number;
  key: string;
  description: string;
  zhOriginal: string;
  enOriginal: string;
  updatedAt: string;
};

type LocaleOpsEditorProps = {
  entries: LocaleOpsEntry[];
  namespace: string;
  q: string;
  recent: "all" | "24h" | "7d";
  action: (formData: FormData) => Promise<void>;
};

type DraftRow = {
  zh: string;
  en: string;
};

export default function LocaleOpsEditor({ entries, namespace, q, recent, action }: LocaleOpsEditorProps) {
  const initialDrafts = useMemo(() => {
    const map: Record<number, DraftRow> = {};
    for (const entry of entries) {
      map[entry.id] = { zh: entry.zhOriginal, en: entry.enOriginal };
    }
    return map;
  }, [entries]);

  const [drafts, setDrafts] = useState<Record<number, DraftRow>>(initialDrafts);
  const [showChangedOnly, setShowChangedOnly] = useState(false);

  const isDirty = (entry: LocaleOpsEntry) => {
    const draft = drafts[entry.id] || { zh: "", en: "" };
    return draft.zh.trim() !== entry.zhOriginal.trim() || draft.en.trim() !== entry.enOriginal.trim();
  };

  const visibleEntries = showChangedOnly ? entries.filter((entry) => isDirty(entry)) : entries;
  const dirtyCount = entries.filter((entry) => isDirty(entry)).length;

  const updateDraft = (id: number, field: "zh" | "en", value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { zh: "", en: "" }),
        [field]: value,
      },
    }));
  };

  const revertRow = (entry: LocaleOpsEntry) => {
    setDrafts((prev) => ({
      ...prev,
      [entry.id]: {
        zh: entry.zhOriginal,
        en: entry.enOriginal,
      },
    }));
  };

  return (
    <form action={action}>
      <input type="hidden" name="ns" value={namespace} />
      <input type="hidden" name="q" value={q} />
      <input type="hidden" name="recent" value={recent} />

      <p style={{ margin: "0 0 10px", color: "#425560", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showChangedOnly}
            onChange={(event) => setShowChangedOnly(event.currentTarget.checked)}
          />
          Show changed rows only
        </label>
        <span>Changed rows: {dirtyCount}</span>
      </p>

      <section style={{ border: "1px solid #e4ebf0", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2.5fr 2.5fr 1.6fr 1.7fr", gap: 0, background: "#f6f9fb", borderBottom: "1px solid #e4ebf0", fontWeight: 700 }}>
          <div style={{ padding: 10 }}>Key</div>
          <div style={{ padding: 10 }}>ZH Value</div>
          <div style={{ padding: 10 }}>EN Value</div>
          <div style={{ padding: 10 }}>Description</div>
          <div style={{ padding: 10 }}>Updated At</div>
        </div>

        {visibleEntries.length > 0 ? (
          visibleEntries.map((entry) => {
            const draft = drafts[entry.id] || { zh: "", en: "" };
            const dirty = isDirty(entry);
            return (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2.5fr 2.5fr 1.6fr 1.7fr",
                  gap: 0,
                  borderBottom: "1px solid #edf2f6",
                  background: dirty ? "#fcffef" : "#fff",
                }}
              >
                <div style={{ padding: 10, color: "#22323c" }}>
                  <input type="hidden" name="entryId" value={entry.id} />
                  <code>{entry.key}</code>
                  <p style={{ margin: "8px 0 0" }}>
                    <button
                      type="button"
                      onClick={() => revertRow(entry)}
                      disabled={!dirty}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #c7d6e0",
                        background: dirty ? "#fff" : "#f4f7f9",
                        color: "#3a5566",
                        cursor: dirty ? "pointer" : "not-allowed",
                      }}
                    >
                      Revert row
                    </button>
                  </p>
                </div>
                <div style={{ padding: 10 }}>
                  <input type="hidden" name={`zh0:${entry.id}`} value={entry.zhOriginal} />
                  <textarea
                    name={`zh:${entry.id}`}
                    value={draft.zh}
                    onChange={(event) => updateDraft(entry.id, "zh", event.currentTarget.value)}
                    rows={2}
                    style={{ width: "100%", padding: 8, border: "1px solid #d5e0e8", borderRadius: 8, resize: "vertical" }}
                  />
                </div>
                <div style={{ padding: 10 }}>
                  <input type="hidden" name={`en0:${entry.id}`} value={entry.enOriginal} />
                  <textarea
                    name={`en:${entry.id}`}
                    value={draft.en}
                    onChange={(event) => updateDraft(entry.id, "en", event.currentTarget.value)}
                    rows={2}
                    style={{ width: "100%", padding: 8, border: "1px solid #d5e0e8", borderRadius: 8, resize: "vertical" }}
                  />
                </div>
                <div style={{ padding: 10, color: "#60717d", fontSize: 13 }}>{entry.description || "-"}</div>
                <div style={{ padding: 10, color: "#60717d", fontSize: 13 }}>
                  {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : "-"}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 14, color: "#5f707b" }}>
            {showChangedOnly
              ? "No modified rows in current result set."
              : "No locale entries found for current query."}
          </div>
        )}
      </section>

      <p style={{ marginTop: 12 }}>
        <button
          type="submit"
          style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #1c5b88", background: "#1c5b88", color: "#fff", cursor: "pointer", fontWeight: 600 }}
        >
          Save Changed Entries
        </button>
      </p>
    </form>
  );
}
