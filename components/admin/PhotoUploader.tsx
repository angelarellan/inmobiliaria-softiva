"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Star,
  X,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, PHOTO_BUCKET_NAME } from "@/lib/photos";
import {
  discardUploadedPhotoAction,
  requestPhotoUploadsAction,
} from "@/app/admin/actions";

export interface PhotoItem {
  key: string;
  /** URL pública una vez subida. */
  url: string | null;
  /** Vista previa local mientras se sube. */
  preview: string | null;
  status: "uploading" | "done" | "error";
  error?: string;
  /** Subida en esta edición (si se saca antes de guardar, se borra del bucket). */
  fresh: boolean;
}

export function photoItemsFrom(urls: string[]): PhotoItem[] {
  return urls.map((url) => ({
    key: url,
    url,
    preview: null,
    status: "done",
    fresh: false,
  }));
}

const MAX_EDGE = 1600;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;

async function decode(file: File) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap as CanvasImageSource,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Se prueba con <img> más abajo.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = document.createElement("img");
    img.src = url;
    await img.decode();
    return {
      source: img as CanvasImageSource,
      width: img.naturalWidth,
      height: img.naturalHeight,
      close: () => undefined,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Achica la foto a 1600 px y la convierte a JPG antes de subirla: las fotos
 * del celular pasan de varios MB a unos cientos de KB, se suben rápido y se
 * ven bien al compartir el link por WhatsApp.
 */
async function compress(file: File): Promise<Blob> {
  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    throw new Error("No pudimos leer esta foto. Probá con JPG o PNG.");
  }
  const { source, width, height, close } = decoded;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la foto.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  close();
  for (const quality of [0.82, 0.72, 0.6]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (blob && blob.size <= MAX_PHOTO_BYTES) return blob;
  }
  throw new Error("La foto pesa más de 5 MB incluso comprimida.");
}

interface Props {
  items: PhotoItem[];
  setItems: (update: (prev: PhotoItem[]) => PhotoItem[]) => void;
}

export default function PhotoUploader({ items, setItems }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const patch = (key: string, changes: Partial<PhotoItem>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...changes } : it)));

  const uploadOne = async (key: string, file: File, othersCount: number) => {
    try {
      const blob = await compress(file);
      const res = await requestPhotoUploadsAction(othersCount, [
        { type: "image/jpeg", size: blob.size },
      ]);
      if (!res.ok) throw new Error(res.error);
      const ticket = res.tickets[0];
      const { error } = await getSupabaseBrowser()
        .storage.from(PHOTO_BUCKET_NAME)
        .uploadToSignedUrl(ticket.path, ticket.token, blob, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
        });
      if (error) throw new Error("No se pudo subir la foto. Revisá tu conexión.");
      patch(key, { status: "done", url: ticket.publicUrl });
    } catch (e) {
      patch(key, {
        status: "error",
        error: e instanceof Error ? e.message : "No se pudo subir la foto.",
      });
    }
  };

  const addFiles = (list: FileList | File[]) => {
    setNotice(null);
    const files = Array.from(list);
    const base = items.length;
    const room = MAX_PHOTOS - base;
    if (room <= 0) {
      setNotice(`Ya cargaste el máximo de ${MAX_PHOTOS} fotos.`);
      return;
    }
    if (files.length > room) {
      setNotice(`Se agregaron ${room} de ${files.length} fotos: el máximo es ${MAX_PHOTOS}.`);
    }

    const accepted = files.slice(0, room).map((file) => {
      const isImage = file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
      const tooBig = file.size > MAX_INPUT_BYTES;
      const item: PhotoItem = {
        key: crypto.randomUUID(),
        url: null,
        preview: isImage ? URL.createObjectURL(file) : null,
        status: isImage && !tooBig ? "uploading" : "error",
        error: !isImage
          ? "Solo se pueden subir imágenes."
          : tooBig
            ? "La foto es demasiado pesada."
            : undefined,
        fresh: true,
      };
      return { item, file };
    });

    setItems((prev) => [...prev, ...accepted.map((a) => a.item)]);

    // Sube de a 3 a la vez.
    const queue = accepted
      .map((a, i) => ({ ...a, othersCount: base + i }))
      .filter((a) => a.item.status === "uploading");
    const worker = async () => {
      while (queue.length) {
        const next = queue.shift();
        if (next) await uploadOne(next.item.key, next.file, next.othersCount);
      }
    };
    void Promise.all([worker(), worker(), worker()]);
  };

  const remove = (index: number) => {
    const item = items[index];
    if (!item) return;
    if (item.preview) URL.revokeObjectURL(item.preview);
    if (item.fresh && item.url) void discardUploadedPhotoAction(item.url);
    setItems((prev) => prev.filter((it) => it.key !== item.key));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <label
        htmlFor="photo-input"
        onDragOver={(e) => {
          e.preventDefault();
          if (dragIndex.current === null) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragOver
            ? "border-gold bg-gold/10"
            : "border-slate/20 bg-white hover:border-gold hover:bg-gold/5"
        } ${items.length >= MAX_PHOTOS ? "pointer-events-none opacity-50" : ""}`}
      >
        <ImagePlus size={28} className="text-emerald" />
        <span className="text-sm font-semibold text-slate">
          <span className="sm:hidden">Tocá para elegir fotos</span>
          <span className="hidden sm:inline">Arrastrá las fotos acá o hacé clic para elegirlas</span>
        </span>
        <span className="text-xs text-slate/55">
          Hasta {MAX_PHOTOS} fotos · JPG, PNG o WebP · se comprimen solas (máx. 5 MB c/u)
        </span>
        <input
          ref={inputRef}
          id="photo-input"
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {notice && (
        <p className="mt-2 text-xs font-medium text-[#8a6d12]" role="status">
          {notice}
        </p>
      )}

      {items.length > 0 && (
        <>
          <p className="mt-4 text-xs text-slate/55">
            {items.length}/{MAX_PHOTOS} fotos · La primera es la portada. Usá las flechas
            <span className="hidden sm:inline"> o arrastrá las fotos</span> para
            cambiar el orden.
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {items.map((item, index) => (
              <li
                key={item.key}
                draggable={item.status === "done"}
                onDragStart={() => {
                  dragIndex.current = index;
                }}
                onDragEnd={() => {
                  dragIndex.current = null;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragIndex.current !== null) move(dragIndex.current, index);
                  else if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                  dragIndex.current = null;
                }}
                className={`group relative aspect-[4/3] overflow-hidden rounded-xl bg-emerald/10 ring-2 ${
                  index === 0 ? "ring-gold" : "ring-transparent"
                }`}
              >
                {item.preview ? (
                  <Image
                    src={item.preview}
                    alt={`Foto ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : item.url ? (
                  <Image
                    src={item.url}
                    alt={`Foto ${index + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : null}

                <span
                  className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    index === 0 ? "bg-gold text-emerald" : "bg-emerald/80 text-warm-white"
                  }`}
                >
                  {index === 0 ? "Portada" : index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Sacar foto ${index + 1}`}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-slate shadow transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <X size={14} />
                </button>

                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-emerald/55 text-xs font-medium text-warm-white">
                    <Loader2 size={20} className="animate-spin" />
                    Subiendo…
                  </div>
                )}

                {item.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-900/70 p-2 text-center text-[11px] font-medium text-white">
                    <AlertCircle size={18} />
                    {item.error}
                  </div>
                )}

                {item.status === "done" && items.length > 1 && (
                  <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Mover antes"
                      className="rounded-full bg-white/90 p-1.5 text-emerald shadow disabled:opacity-0"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => move(index, 0)}
                        className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-emerald shadow"
                      >
                        <Star size={12} />
                        Portada
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={index === items.length - 1}
                      aria-label="Mover después"
                      className="rounded-full bg-white/90 p-1.5 text-emerald shadow disabled:opacity-0"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
