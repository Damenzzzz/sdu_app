import { useRef, useState } from "react";
import { isTauri } from "../sdu/tauri";
import {
  listBooks, importBook, readBookUrl, renameBook, moveBook, deleteBook,
  getSections, addSection, formatSize, type Book,
} from "../books/store";
import { Icon } from "../components/Icon";

export function Books() {
  const [books, setBooks] = useState<Book[]>(() => listBooks());
  const [sections, setSections] = useState<string[]>(() => getSections());
  const [active, setActive] = useState("All");
  const [newSection, setNewSection] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [viewer, setViewer] = useState<{ book: Book; url: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    setBooks(listBooks());
    setSections(getSections());
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!isTauri()) {
      setError("Books work in the SDUmi desktop app (need local file storage).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const target = active === "All" ? "General" : active;
      for (const f of Array.from(files)) {
        if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
          await importBook(f, target);
        }
      }
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const open = async (book: Book) => {
    try {
      const url = await readBookUrl(book.id);
      setViewer({ book, url });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const closeViewer = () => {
    if (viewer) URL.revokeObjectURL(viewer.url);
    setViewer(null);
  };

  const filtered = active === "All" ? books : books.filter((b) => b.section === active);
  const count = (s: string) => (s === "All" ? books.length : books.filter((b) => b.section === s).length);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Books</div>
          <div className="page-sub">Your study library — import PDFs and read them in-app</div>
        </div>
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Icon name="upload" size={16} /> {busy ? "Importing…" : "Import PDF"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 14, borderColor: "var(--amber)", color: "var(--amber)", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: "230px 1fr" }}>
        {/* Sections */}
        <div className="card" style={{ padding: 10, height: "fit-content" }}>
          {["All", ...sections].map((s) => (
            <button
              key={s}
              className={`nav-item ${active === s ? "active" : ""}`}
              onClick={() => setActive(s)}
            >
              <Icon name="library" size={15} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</span>
              <span className="badge" style={{ marginLeft: "auto", background: "var(--surface-3)", color: "var(--text-dim)" }}>
                {count(s)}
              </span>
            </button>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <input
              className="input"
              style={{ height: 34, fontSize: 13 }}
              placeholder="New section"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSection.trim()) {
                  setSections(addSection(newSection));
                  setActive(newSection.trim());
                  setNewSection("");
                }
              }}
            />
          </div>
        </div>

        {/* Book grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="card empty" style={{ padding: 48 }}>
              {isTauri()
                ? "No books here yet. Click “Import PDF” to add one."
                : "Books work in the desktop app. Open SDUmi to build your library."}
            </div>
          ) : (
            <div className="grid grid-3 stagger">
              {filtered.map((b) => (
                <div className="card lift" key={b.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div
                    style={{
                      height: 90,
                      borderRadius: "var(--radius-sm)",
                      background: "var(--grad-accent)",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => open(b)}
                  >
                    <Icon name="library" size={34} />
                  </div>

                  {renaming === b.id ? (
                    <input
                      className="input"
                      style={{ height: 32 }}
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { setBooks(renameBook(b.id, renameVal.trim() || b.name)); setRenaming(null); }
                        if (e.key === "Escape") setRenaming(null);
                      }}
                      onBlur={() => { setBooks(renameBook(b.id, renameVal.trim() || b.name)); setRenaming(null); }}
                    />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, wordBreak: "break-word" }}>{b.name}</div>
                  )}

                  <div className="faint" style={{ fontSize: 11.5 }}>{formatSize(b.size)}</div>

                  <select
                    className="input"
                    style={{ height: 32, fontSize: 12.5 }}
                    value={b.section}
                    onChange={(e) => setBooks(moveBook(b.id, e.target.value))}
                  >
                    {sections.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn" style={{ flex: 1, height: 32 }} onClick={() => open(b)}>Open</button>
                    <button className="btn btn-ghost" style={{ height: 32, width: 34 }} title="Rename"
                      onClick={() => { setRenaming(b.id); setRenameVal(b.name); }}>
                      <Icon name="edit" size={15} />
                    </button>
                    <button className="btn btn-ghost" style={{ height: 32, width: 34, color: "var(--red)" }} title="Delete"
                      onClick={async () => setBooks(await deleteBook(b.id))}>
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PDF viewer */}
      {viewer && (
        <div className="modal-overlay" onClick={closeViewer}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div style={{ fontWeight: 600 }}>{viewer.book.name}</div>
              <button className="btn btn-ghost" style={{ width: 36 }} onClick={closeViewer}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <embed src={viewer.url} type="application/pdf" style={{ width: "100%", height: "100%", border: "none" }} />
          </div>
        </div>
      )}
    </div>
  );
}
