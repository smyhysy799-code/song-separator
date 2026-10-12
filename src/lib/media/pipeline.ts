import { MAX_DURATION_SECONDS, SAMPLE_RATE } from "./constants";
import { extractAudio, muxVideo } from "./ffmpeg";
import type { ValidatedMedia } from "./validate";
import { encodeWav } from "./wav";

export type Stage = "reading" | "analyzing" | "model" | "init" | "separating" | "finalizing" | "muxing";

export interface StageUpdate {
  stage: Stage;
  /** Real progress 0..1 when measurable, null for an indeterminate step. */
  progress: number | null;
  detail?: string;
}

export interface SeparationResult {
  duration: number;
  vocalsWav: Blob;
  musicWav: Blob;
  video?: { blob: Blob; extension: string };
}

export class PipelineError extends Error {
  constructor(public userMessage: string, cause?: unknown) {
    super(userMessage, { cause });
  }
}

async function decode(file: File, media: ValidatedMedia, onStage: (u: StageUpdate) => void) {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ac = new AC({ sampleRate: SAMPLE_RATE });
  try {
    try {
      return await ac.decodeAudioData(await file.arrayBuffer());
    } catch (err) {
      if (media.kind !== "video") throw err;
      onStage({ stage: "analyzing", progress: null, detail: "استخراج المسار الصوتي من الفيديو" });
      const wav = await extractAudio(file, media.extension);
      return await ac.decodeAudioData(await wav.arrayBuffer());
    }
  } catch (err) {
    throw new PipelineError(
      media.kind === "video"
        ? "تعذّر قراءة الصوت من هذا الفيديو. تأكد من أنه يحتوي على مسار صوتي."
        : "تعذّر قراءة هذا الملف الصوتي. قد يكون تالفًا أو بترميز غير مدعوم.",
      err,
    );
  } finally {
    ac.close().catch(() => {});
  }
}

function runModel(
  left: Float32Array,
  right: Float32Array,
  onStage: (u: StageUpdate) => void,
  signal: AbortSignal,
): Promise<[Float32Array, Float32Array]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./separator.worker.ts", import.meta.url), { type: "module" });
    const stop = () => {
      worker.terminate();
      reject(new PipelineError("تم إلغاء المعالجة."));
    };
    signal.addEventListener("abort", stop, { once: true });
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === "stage" && m.stage === "model") onStage({ stage: "model", progress: null });
      else if (m.type === "stage" && m.stage === "init") onStage({ stage: "init", progress: null });
      else if (m.type === "download")
        onStage({ stage: "model", progress: m.loaded / m.total, detail: m.cached ? "من الذاكرة المؤقتة" : undefined });
      else if (m.type === "stage" && m.stage === "separating") onStage({ stage: "separating", progress: 0 });
      else if (m.type === "progress")
        onStage({ stage: "separating", progress: m.done / m.total, detail: `المقطع ${m.done} من ${m.total}` });
      else if (m.type === "done") {
        signal.removeEventListener("abort", stop);
        worker.terminate();
        resolve([m.left, m.right]);
      } else if (m.type === "error") {
        signal.removeEventListener("abort", stop);
        worker.terminate();
        reject(
          new PipelineError(
            m.message === "MODEL_DOWNLOAD_FAILED"
              ? "تعذّر تنزيل نموذج الذكاء الاصطناعي. تحقق من اتصالك بالإنترنت ثم أعد المحاولة."
              : "حدث خطأ أثناء فصل الصوت. قد تكون ذاكرة الجهاز غير كافية؛ جرّب ملفًا أقصر أو أغلق التبويبات الأخرى.",
            m.message,
          ),
        );
      }
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new PipelineError("تعذّر تشغيل محرك الذكاء الاصطناعي في هذا المتصفح.", e));
    };
    // Copies are transferred so the original buffer stays usable for the music stem.
    const l = left.slice();
    const r = right.slice();
    worker.postMessage({ left: l, right: r }, [l.buffer, r.buffer]);
  });
}

export async function separateMedia(
  file: File,
  media: ValidatedMedia,
  onStage: (u: StageUpdate) => void,
  signal: AbortSignal,
): Promise<SeparationResult> {
  onStage({ stage: "analyzing", progress: null });
  const audio = await decode(file, media, onStage);
  if (audio.duration > MAX_DURATION_SECONDS)
    throw new PipelineError("مدة الملف أطول من الحد المسموح (10 دقائق).");
  if (signal.aborted) throw new PipelineError("تم إلغاء المعالجة.");

  const left = audio.getChannelData(0);
  const right = audio.numberOfChannels > 1 ? audio.getChannelData(1) : left;
  const [vl, vr] = await runModel(left, right, onStage, signal);

  onStage({ stage: "finalizing", progress: null });
  await new Promise((r) => setTimeout(r, 30));
  const ml = new Float32Array(left.length);
  const mr = new Float32Array(left.length);
  for (let i = 0; i < left.length; i++) {
    ml[i] = left[i] - vl[i];
    mr[i] = right[i] - vr[i];
  }
  const vocalsWav = encodeWav([vl, vr], SAMPLE_RATE);
  const musicWav = encodeWav([ml, mr], SAMPLE_RATE);

  let video: SeparationResult["video"];
  if (media.kind === "video") {
    onStage({ stage: "muxing", progress: 0 });
    try {
      video = await muxVideo(file, media.extension, vocalsWav, (p) => onStage({ stage: "muxing", progress: p }));
    } catch (err) {
      throw new PipelineError("تم فصل الصوت، لكن تعذّر دمجه مع الفيديو. أعد المحاولة.", err);
    }
  }
  return { duration: audio.duration, vocalsWav, musicWav, video };
}
