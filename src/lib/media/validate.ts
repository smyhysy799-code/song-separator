import { AUDIO_EXTENSIONS, MAX_FILE_BYTES, VIDEO_EXTENSIONS } from "./constants";

export type MediaKind = "audio" | "video";

export interface ValidatedMedia {
  kind: MediaKind;
  container: string;
  extension: string;
}

export class MediaValidationError extends Error {}

function ascii(bytes: Uint8Array, start: number, len: number) {
  return String.fromCharCode(...bytes.subarray(start, start + len));
}

/** Detects the real container from the file's leading bytes (not its name). */
function sniffContainer(b: Uint8Array): string | null {
  if (b.length < 12) return null;
  if (ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WAVE") return "wav";
  if (ascii(b, 0, 3) === "ID3") return "mp3";
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return "mp3"; // MPEG frame sync (also raw AAC ADTS)
  if (ascii(b, 4, 4) === "ftyp") {
    const brand = ascii(b, 8, 4);
    if (brand.startsWith("M4A") || brand.startsWith("M4B")) return "m4a";
    if (brand === "qt  ") return "mov";
    return "mp4";
  }
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "webm";
  if (ascii(b, 0, 4) === "OggS") return "ogg";
  if (ascii(b, 0, 4) === "fLaC") return "flac";
  return null;
}

export async function validateMediaFile(file: File): Promise<ValidatedMedia> {
  if (file.size === 0) throw new MediaValidationError("الملف فارغ.");
  if (file.size > MAX_FILE_BYTES)
    throw new MediaValidationError("حجم الملف أكبر من الحد المسموح (300 ميجابايت).");

  const extension = (file.name.split(".").pop() ?? "").toLowerCase();
  const known = [...AUDIO_EXTENSIONS, ...VIDEO_EXTENSIONS] as readonly string[];
  if (!known.includes(extension))
    throw new MediaValidationError("صيغة الملف غير مدعومة.");

  const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const container = sniffContainer(head);
  if (!container)
    throw new MediaValidationError("محتوى الملف لا يطابق صيغة صوت أو فيديو معروفة.");

  let kind: MediaKind;
  if (["wav", "mp3", "m4a", "ogg", "flac"].includes(container)) kind = "audio";
  else if (container === "mov") kind = "video";
  else if (container === "webm") kind = file.type.startsWith("audio") ? "audio" : "video";
  else kind = (VIDEO_EXTENSIONS as readonly string[]).includes(extension) || file.type.startsWith("video") ? "video" : "audio";

  return { kind, container, extension };
}
