// Browser-only FFmpeg (WebAssembly). Lazy-loaded only when a video or MP3 export is needed.
import type { FFmpeg } from "@ffmpeg/ffmpeg";

const CORE_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";
let loading: Promise<FFmpeg> | null = null;

export function getFFmpeg(): Promise<FFmpeg> {
  if (!loading) {
    loading = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);
      const ff = new FFmpeg();
      await ff.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      });
      return ff;
    })().catch((e) => {
      loading = null;
      throw e;
    });
  }
  return loading;
}

async function run(
  args: string[],
  inputs: Record<string, Blob>,
  output: string,
  type: string,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const ff = await getFFmpeg();
  const handler = ({ progress }: { progress: number }) =>
    onProgress?.(Math.max(0, Math.min(1, progress)));
  ff.on("progress", handler);
  try {
    for (const [name, blob] of Object.entries(inputs)) {
      await ff.writeFile(name, new Uint8Array(await blob.arrayBuffer()));
    }
    const code = await ff.exec(args);
    if (code !== 0) throw new Error("FFMPEG_FAILED");
    const data = (await ff.readFile(output)) as Uint8Array;
    return new Blob([data.slice()], { type });
  } finally {
    ff.off("progress", handler);
    for (const name of [...Object.keys(inputs), output]) {
      await ff.deleteFile(name).catch(() => {});
    }
  }
}

/** Pulls the audio track out of a video as 44.1 kHz stereo WAV. */
export function extractAudio(file: File, ext: string) {
  const input = `in.${ext}`;
  return run(
    ["-i", input, "-vn", "-ac", "2", "-ar", "44100", "-c:a", "pcm_s16le", "out.wav"],
    { [input]: file },
    "out.wav",
    "audio/wav",
  );
}

/** Replaces the video's soundtrack with the vocals track, copying the picture untouched. */
export async function muxVideo(
  file: File,
  ext: string,
  vocals: Blob,
  onProgress?: (p: number) => void,
): Promise<{ blob: Blob; extension: string }> {
  const input = `video.${ext}`;
  const webm = ext === "webm";
  const outExt = webm ? "webm" : ext === "mov" ? "mov" : "mp4";
  const audioArgs = webm ? ["-c:a", "libopus", "-b:a", "160k"] : ["-c:a", "aac", "-b:a", "192k"];
  const out = `result.${outExt}`;
  const blob = await run(
    ["-i", input, "-i", "vocals.wav", "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", ...audioArgs, "-shortest", out],
    { [input]: file, "vocals.wav": vocals },
    out,
    webm ? "video/webm" : outExt === "mov" ? "video/quicktime" : "video/mp4",
    onProgress,
  );
  return { blob, extension: outExt };
}

export function wavToMp3(wav: Blob) {
  return run(
    ["-i", "in.wav", "-c:a", "libmp3lame", "-b:a", "256k", "out.mp3"],
    { "in.wav": wav },
    "out.mp3",
    "audio/mpeg",
  );
}
