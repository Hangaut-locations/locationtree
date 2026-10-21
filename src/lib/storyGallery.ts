export type RecentShot = {
  key: string;
  file: File;
  url: string;
};

type StoredShot = {
  key: string;
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
};

const DB_NAME = "hangaut-story-gallery";
const HANDLE_KEY = "pictures";
const LIST_KEY = "list";
const MAX_KEEP = 16;
const MAX_SHOW = 24;
const MAX_SCAN = 250;

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("handles")) db.createObjectStore("handles");
      if (!db.objectStoreNames.contains("shots")) db.createObjectStore("shots");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const idbGet = <T>(db: IDBDatabase, store: string, key: string) =>
  new Promise<T | undefined>((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });

const idbPut = (db: IDBDatabase, store: string, key: string, value: unknown) =>
  new Promise<void>((resolve, reject) => {
    const request = db.transaction(store, "readwrite").objectStore(store).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });

const shotKey = (file: File) => `${file.name}:${file.lastModified}:${file.size}`;

const toShot = (file: File): RecentShot => ({
  key: shotKey(file),
  file,
  url: URL.createObjectURL(file),
});

const shrinkImage = (file: File) =>
  new Promise<File>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const edge = Math.max(image.width, image.height) || 1;
      const scale = Math.min(1, 1200 / edge);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(
            new File([blob], file.name || "story.jpg", {
              type: "image/jpeg",
              lastModified: file.lastModified,
            }),
          );
        },
        "image/jpeg",
        0.85,
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    image.src = url;
  });

const savedShots = async () => {
  const db = await openDb();
  const stored = (await idbGet<StoredShot[]>(db, "shots", LIST_KEY)) ?? [];
  return stored.map((item) =>
    toShot(new File([item.blob], item.name, { type: item.type, lastModified: item.lastModified })),
  );
};

/** Keep a small copy on this phone so the next story camera can show it at once. */
export const rememberShot = async (file: File) => {
  const kept = file.type.startsWith("image/") ? await shrinkImage(file) : file;
  if (kept.size > 8 * 1024 * 1024) return;
  const db = await openDb();
  const current = (await idbGet<StoredShot[]>(db, "shots", LIST_KEY)) ?? [];
  const next: StoredShot = {
    key: shotKey(kept),
    name: kept.name,
    type: kept.type || file.type,
    lastModified: kept.lastModified,
    blob: kept,
  };
  const list = [next, ...current.filter((item) => item.key !== next.key)].slice(0, MAX_KEEP);
  await idbPut(db, "shots", LIST_KEY, list);
};

const readHandle = async () => {
  const db = await openDb();
  return idbGet<FileSystemDirectoryHandle>(db, "handles", HANDLE_KEY);
};

const keepNewest = (files: File[], file: File) => {
  files.push(file);
  files.sort((a, b) => b.lastModified - a.lastModified);
  if (files.length > MAX_SHOW) files.length = MAX_SHOW;
};

const scanDirectory = async (dir: FileSystemDirectoryHandle) => {
  const files: File[] = [];
  let seen = 0;
  const consider = async (entry: FileSystemHandle) => {
    if (seen >= MAX_SCAN || entry.kind !== "file") return;
    seen += 1;
    const file = await (entry as FileSystemFileHandle).getFile();
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
    keepNewest(files, file);
    if (seen % 12 === 0) await new Promise((resolve) => window.setTimeout(resolve, 0));
  };
  for await (const entry of dir.values()) {
    if (seen >= MAX_SCAN) break;
    if (entry.kind === "directory") {
      for await (const child of entry.values()) {
        await consider(child);
        if (seen >= MAX_SCAN) break;
      }
      continue;
    }
    await consider(entry);
  }
  return files;
};

type ReadableDir = FileSystemDirectoryHandle & {
  queryPermission(descriptor: { mode: "read" }): Promise<PermissionState>;
  requestPermission(descriptor: { mode: "read" }): Promise<PermissionState>;
};

type PicturePicker = (options: {
  id?: string;
  mode?: "read";
  startIn?: "pictures";
}) => Promise<FileSystemDirectoryHandle>;

const asDir = (dir: FileSystemDirectoryHandle) => dir as ReadableDir;

const picturePicker = () =>
  (window as Window & { showDirectoryPicker?: PicturePicker }).showDirectoryPicker;

const canRead = async (dir: FileSystemDirectoryHandle) => {
  try {
    return (await asDir(dir).queryPermission({ mode: "read" })) === "granted";
  } catch {
    return false;
  }
};

/**
 * Pictures already on this phone, then the pictures folder if this browser
 * was allowed to read it. Calls back as soon as the saved pictures are ready.
 */
export const loadRecentPictures = async (onUpdate: (shots: RecentShot[]) => void) => {
  const saved = await savedShots();
  onUpdate(saved);
  const dir = await readHandle();
  if (!dir || !(await canRead(dir))) return;
  const fromFolder = (await scanDirectory(dir)).map(toShot);
  const seen = new Set(fromFolder.map((shot) => shot.key));
  onUpdate([...fromFolder, ...saved.filter((shot) => !seen.has(shot.key))].slice(0, MAX_SHOW));
};

/** Ask once for the pictures folder. Later story cameras can read it without asking. */
export const allowPicturesFolder = async () => {
  const picker = picturePicker();
  if (typeof picker !== "function") return false;
  const existing = await readHandle();
  if (existing) {
    try {
      if ((await asDir(existing).requestPermission({ mode: "read" })) === "granted") return true;
    } catch {
      /* the old folder is gone, so ask for a new one */
    }
  }
  try {
    const dir = await picker({
      id: "hangaut-story-pictures",
      mode: "read",
      startIn: "pictures",
    });
    const db = await openDb();
    await idbPut(db, "handles", HANDLE_KEY, dir);
    return true;
  } catch {
    return false;
  }
};

export const browserCanRememberPictures = () => typeof picturePicker() === "function";
