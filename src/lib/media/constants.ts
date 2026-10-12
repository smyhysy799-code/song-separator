export const MAX_FILE_BYTES = 300 * 1024 * 1024; // 300 MB
export const MAX_DURATION_SECONDS = 10 * 60; // 10 minutes
export const SAMPLE_RATE = 44100;

export const AUDIO_EXTENSIONS = ["mp3", "wav", "m4a", "aac", "ogg", "flac", "opus"] as const;
export const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "mkv"] as const;

export const ACCEPT_ATTR = [
  ...AUDIO_EXTENSIONS.map((e) => `.${e}`),
  ...VIDEO_EXTENSIONS.map((e) => `.${e}`),
  "audio/*",
  "video/*",
].join(",");

/** Open-source HT-Demucs (fine-tuned vocals specialist), MIT licence, exported to ONNX. */
export const MODEL_URL =
  "https://huggingface.co/StemSplitio/htdemucs-ft-vocals-onnx/resolve/main/htdemucs_ft_vocals_fp16weights.onnx";
export const MODEL_SIZE_BYTES = 165_612_636;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
