// Local book library. Files are copied into the app's data dir ($APPDATA/books)
// and opened in-app as blob URLs; metadata (name, section) lives in local storage.
// Desktop-only (needs the Tauri filesystem).

import { loadJSON, saveJSON } from "../store/persist";
import { isTauri } from "../sdu/tauri";

export interface Book {
  id: string;
  name: string;
  section: string;
  addedAt: number;
  size: number;
}

const KEY = "books";
const DIR = "books";

export function listBooks(): Book[] {
  return loadJSON<Book[]>(KEY, []);
}

function save(books: Book[]): Book[] {
  saveJSON(KEY, books);
  return books;
}

async function fs() {
  return import("@tauri-apps/plugin-fs");
}

export async function importBook(file: File, section = "General"): Promise<Book> {
  if (!isTauri()) throw new Error("Books require the desktop app.");
  const { writeFile, mkdir, exists, BaseDirectory } = await fs();
  if (!(await exists(DIR, { baseDir: BaseDirectory.AppData }))) {
    await mkdir(DIR, { baseDir: BaseDirectory.AppData, recursive: true });
  }
  const id = crypto.randomUUID();
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(`${DIR}/${id}.pdf`, bytes, { baseDir: BaseDirectory.AppData });
  const book: Book = {
    id,
    name: file.name.replace(/\.pdf$/i, ""),
    section,
    addedAt: Date.now(),
    size: file.size,
  };
  save([book, ...listBooks()]);
  return book;
}

// Returns a blob: URL for an <embed>/<iframe>. Revoke it when done.
export async function readBookUrl(id: string): Promise<string> {
  const { readFile, BaseDirectory } = await fs();
  const bytes = await readFile(`${DIR}/${id}.pdf`, { baseDir: BaseDirectory.AppData });
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

export function renameBook(id: string, name: string): Book[] {
  return save(listBooks().map((b) => (b.id === id ? { ...b, name } : b)));
}

export function moveBook(id: string, section: string): Book[] {
  return save(listBooks().map((b) => (b.id === id ? { ...b, section } : b)));
}

export async function deleteBook(id: string): Promise<Book[]> {
  try {
    const { remove, BaseDirectory } = await fs();
    await remove(`${DIR}/${id}.pdf`, { baseDir: BaseDirectory.AppData });
  } catch {
    /* file may already be gone */
  }
  return save(listBooks().filter((b) => b.id !== id));
}

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---- Sections (categories) ----
const SECTIONS_KEY = "bookSections";
const DEFAULT_SECTIONS = ["General", "Calculus", "Linear Algebra", "Programming"];

export function getSections(): string[] {
  const saved = loadJSON<string[]>(SECTIONS_KEY, DEFAULT_SECTIONS);
  const used = listBooks().map((b) => b.section);
  return Array.from(new Set([...saved, ...used]));
}

export function addSection(name: string): string[] {
  const n = name.trim();
  if (n) {
    const saved = loadJSON<string[]>(SECTIONS_KEY, DEFAULT_SECTIONS);
    if (!saved.includes(n)) saveJSON(SECTIONS_KEY, [...saved, n]);
  }
  return getSections();
}
