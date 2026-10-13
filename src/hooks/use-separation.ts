import { useCallback, useEffect, useRef, useState } from "react";
import { PipelineError, separateMedia, type StageUpdate } from "@/lib/media/pipeline";
import { MediaValidationError, validateMediaFile, type ValidatedMedia } from "@/lib/media/validate";

export interface ResultUrls {
  original: string;
  vocals: string;
  music: string;
  video?: string | undefined;
  videoExt?: string | undefined;
  vocalsWav: Blob;
  musicWav: Blob;
  videoBlob?: Blob | undefined;
  duration: number;
}

type State =
  | { status: "idle"; error?: string }
  | { status: "ready"; file: File; media: ValidatedMedia; preview: string }
  | { status: "processing"; file: File; media: ValidatedMedia; preview: string; update: StageUpdate }
  | { status: "done"; file: File; media: ValidatedMedia; result: ResultUrls }
  | { status: "error"; file: File; media: ValidatedMedia; preview: string; error: string };

export function useSeparation() {
  const [state, setState] = useState<State>({ status: "idle" });
  const urls = useRef<string[]>([]);
  const abort = useRef<AbortController | null>(null);

  const track = (u: string) => {
    urls.current.push(u);
    return u;
  };
  const revokeAll = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u));
    urls.current = [];
  };
  useEffect(() => () => {
    abort.current?.abort();
    revokeAll();
  }, []);

  const selectFile = useCallback(async (file: File) => {
    abort.current?.abort();
    revokeAll();
    try {
      const media = await validateMediaFile(file);
      setState({ status: "ready", file, media, preview: track(URL.createObjectURL(file)) });
    } catch (e) {
      setState({
        status: "idle",
        error: e instanceof MediaValidationError ? e.message : "تعذّر قراءة الملف.",
      });
    }
  }, []);

  const start = useCallback(async () => {
    if (state.status !== "ready" && state.status !== "error") return;
    const { file, media, preview } = state;
    const ctrl = new AbortController();
    abort.current = ctrl;
    const onStage = (update: StageUpdate) =>
      !ctrl.signal.aborted && setState({ status: "processing", file, media, preview, update });
    onStage({ stage: "reading", progress: null });
    try {
      const r = await separateMedia(file, media, onStage, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setState({
        status: "done",
        file,
        media,
        result: {
          original: preview,
          vocals: track(URL.createObjectURL(r.vocalsWav)),
          music: track(URL.createObjectURL(r.musicWav)),
          video: r.video ? track(URL.createObjectURL(r.video.blob)) : undefined,
          videoExt: r.video?.extension,
          videoBlob: r.video?.blob,
          vocalsWav: r.vocalsWav,
          musicWav: r.musicWav,
          duration: r.duration,
        },
      });
    } catch (e) {
      if (ctrl.signal.aborted) return;
      console.error(e);
      setState({
        status: "error",
        file,
        media,
        preview,
        error: e instanceof PipelineError ? e.userMessage : "حدث خطأ غير متوقع أثناء المعالجة.",
      });
    }
  }, [state]);

  const reset = useCallback(() => {
    abort.current?.abort();
    revokeAll();
    setState({ status: "idle" });
  }, []);

  return { state, selectFile, start, reset };
}
