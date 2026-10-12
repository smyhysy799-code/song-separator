/// <reference lib="webworker" />
// Runs HT-Demucs (ONNX) fully inside the user's browser, off the main thread.
import { MODEL_SIZE_BYTES, MODEL_URL } from "./constants";

const ORT_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/";
const CACHE_NAME = "sawti-models-v1";
const N = 343_980; // model segment: 7.8 s @ 44.1 kHz, fixed by the graph
const OVERLAP = Math.floor(N / 4);
const STRIDE = N - OVERLAP;
const VOCALS_ROW = 3; // stems order: drums, bass, other, vocals

const ctx = self as unknown as DedicatedWorkerGlobalScope;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ort: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let session: any = null;

const post = (msg: unknown, transfer: Transferable[] = []) => ctx.postMessage(msg, transfer);

async function fetchModel(): Promise<Uint8Array> {
  let cache: Cache | null = null;
  try {
    cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(MODEL_URL);
    if (hit) {
      post({ type: "download", loaded: 1, total: 1, cached: true });
      return new Uint8Array(await hit.arrayBuffer());
    }
  } catch {
    cache = null;
  }
  const res = await fetch(MODEL_URL);
  if (!res.ok || !res.body) throw new Error("MODEL_DOWNLOAD_FAILED");
  const total = Number(res.headers.get("content-length")) || MODEL_SIZE_BYTES;
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let loaded = 0;
  let lastPost = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    loaded += value.length;
    const now = performance.now();
    if (now - lastPost > 150) {
      post({ type: "download", loaded, total, cached: false });
      lastPost = now;
    }
  }
  const bytes = new Uint8Array(loaded);
  let off = 0;
  for (const p of parts) {
    bytes.set(p, off);
    off += p.length;
  }
  post({ type: "download", loaded, total: loaded, cached: false });
  if (cache) {
    try {
      await cache.put(MODEL_URL, new Response(bytes.slice()));
    } catch {
      /* storage quota — model will just be downloaded again next time */
    }
  }
  return bytes;
}

async function ensureSession() {
  if (session) return;
  if (!ort) {
    ort = await import(/* @vite-ignore */ `${ORT_BASE}ort.wasm.min.mjs`);
    ort.env.wasm.wasmPaths = ORT_BASE;
    ort.env.wasm.numThreads = ctx.crossOriginIsolated
      ? Math.min(navigator.hardwareConcurrency || 2, 4)
      : 1;
  }
  const bytes = await fetchModel();
  post({ type: "stage", stage: "init" });
  session = await ort.InferenceSession.create(bytes, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
}

function makeWindow(): Float32Array {
  const w = new Float32Array(N).fill(1);
  for (let i = 0; i < OVERLAP; i++) {
    const v = (i + 1) / (OVERLAP + 1);
    w[i] = v;
    w[N - 1 - i] = v;
  }
  return w;
}

async function separate(left: Float32Array, right: Float32Array) {
  const total = left.length;
  const chunks = Math.max(1, Math.ceil(Math.max(total - OVERLAP, 1) / STRIDE));
  const outL = new Float32Array(total);
  const outR = new Float32Array(total);
  const weight = new Float32Array(total);
  const win = makeWindow();
  const input = new Float32Array(2 * N);
  post({ type: "progress", done: 0, total: chunks });

  for (let i = 0; i < chunks; i++) {
    const start = i * STRIDE;
    const end = Math.min(start + N, total);
    const len = end - start;
    input.fill(0);
    input.set(left.subarray(start, end), 0);
    input.set(right.subarray(start, end), N);
    const tensor = new ort.Tensor("float32", input, [1, 2, N]);
    const result = await session.run({ mix: tensor });
    const stems = result.stems.data as Float32Array;
    const base = VOCALS_ROW * 2 * N;
    for (let s = 0; s < len; s++) {
      // First/last chunk keep full weight at the file edges
      const w = (i === 0 && s < OVERLAP) || (i === chunks - 1 && s >= len - OVERLAP) ? 1 : win[s];
      outL[start + s] += stems[base + s] * w;
      outR[start + s] += stems[base + N + s] * w;
      weight[start + s] += w;
    }
    tensor.dispose?.();
    post({ type: "progress", done: i + 1, total: chunks });
  }
  for (let s = 0; s < total; s++) {
    const w = weight[s] || 1;
    outL[s] /= w;
    outR[s] /= w;
  }
  return [outL, outR] as const;
}

ctx.onmessage = async (e: MessageEvent<{ left: Float32Array; right: Float32Array }>) => {
  try {
    post({ type: "stage", stage: "model" });
    await ensureSession();
    post({ type: "stage", stage: "separating" });
    const [vl, vr] = await separate(e.data.left, e.data.right);
    post({ type: "done", left: vl, right: vr }, [vl.buffer, vr.buffer]);
  } catch (err) {
    post({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
