import { useRef, useState, type DragEvent } from "react";
import {
  AlertCircle, AudioLines, Check, Download, FileAudio, FileVideo, Loader2, Mic2, Music2,
  RotateCcw, ShieldCheck, Sparkles, UploadCloud, Film,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSeparation, type ResultUrls } from "@/hooks/use-separation";
import { ACCEPT_ATTR, formatBytes, formatDuration } from "@/lib/media/constants";
import type { Stage } from "@/lib/media/pipeline";
import { cn } from "@/lib/utils";
import { SoundWave } from "@/components/site/SoundWave";

const STAGES: { key: Stage[]; label: string }[] = [
  { key: ["reading", "analyzing"], label: "جاري قراءة الملف وتحليل الصوت" },
  { key: ["model", "init"], label: "جاري تجهيز نموذج الذكاء الاصطناعي" },
  { key: ["separating"], label: "جاري فصل الموسيقى عن الصوت البشري" },
  { key: ["finalizing", "muxing"], label: "جاري تجهيز الملفات" },
];

const STAGE_TEXT: Record<Stage, string> = {
  reading: "جاري قراءة الملف…",
  analyzing: "جاري تحليل الصوت…",
  model: "جاري تنزيل نموذج Demucs (مرة واحدة فقط)…",
  init: "جاري تشغيل محرك الذكاء الاصطناعي…",
  separating: "جاري فصل الموسيقى عن الصوت البشري…",
  finalizing: "جاري تجهيز الملفات الصوتية…",
  muxing: "جاري دمج الصوت البشري مع الفيديو…",
};

export function Studio() {
  const { state, selectFile, start, reset } = useSeparation();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void selectFile(f);
  };
  const pick = () => input.current?.click();

  return (
    <div className="relative rounded-[2rem] border border-lilac-100 bg-card p-3 shadow-lift sm:p-4">
      <input
        ref={input}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void selectFile(f);
          e.target.value = "";
        }}
      />
      <Steps current={state.status === "done" ? 3 : state.status === "processing" ? 2 : state.status === "idle" ? 1 : 2} />

      {state.status === "idle" && (
        <div
          role="button"
          tabIndex={0}
          onClick={pick}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "group relative mt-3 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed px-5 py-12 text-center transition-all duration-300 sm:py-16",
            dragging ? "scale-[1.01] border-lilac-600 bg-lilac-100/60" : "border-lilac-100 bg-soft hover:border-lilac-400 hover:bg-lilac-50",
          )}
        >
          <div className={cn("grid size-20 place-items-center rounded-3xl bg-card shadow-soft transition-transform duration-300", dragging ? "-translate-y-1 scale-110" : "group-hover:-translate-y-1")}>
            <UploadCloud className="size-9 text-lilac-600" strokeWidth={1.6} />
          </div>
          <h3 className="mt-6 text-xl font-bold sm:text-2xl">اسحب ملفك هنا أو اضغط للاختيار</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            صوت: MP3 · WAV · M4A · FLAC · OGG &nbsp;—&nbsp; فيديو: MP4 · MOV · WebM
          </p>
          <p className="mt-1 text-xs text-muted-foreground">الحد الأقصى 300 ميجابايت ومدة 10 دقائق</p>
          <Button variant="hero" size="lg" className="mt-6" onClick={(e) => { e.stopPropagation(); pick(); }}>
            <UploadCloud /> اختر ملفًا
          </Button>
          {state.error && (
            <p role="alert" className="mt-5 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
              <AlertCircle className="size-4" /> {state.error}
            </p>
          )}
        </div>
      )}

      {(state.status === "ready" || state.status === "processing" || state.status === "error") && (
        <div className="mt-3 space-y-4 rounded-[1.5rem] bg-soft p-4 sm:p-6">
          <FileCard file={state.file} kind={state.media.kind} onChange={state.status !== "processing" ? reset : undefined} />

          {state.status === "ready" && (
            <div className="flex flex-col items-center gap-3 pt-2">
              <Button variant="hero" size="xl" onClick={start} className="w-full sm:w-auto">
                <Sparkles /> إزالة الموسيقى ✨
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                تتم المعالجة على جهازك. أول مرة فقط يتم تنزيل النموذج (حوالي 166 ميجابايت).
              </p>
            </div>
          )}

          {state.status === "processing" && <Progress stage={state.update.stage} progress={state.update.progress} detail={state.update.detail} onCancel={reset} />}

          {state.status === "error" && (
            <div role="alert" className="rounded-2xl border border-destructive/20 bg-card p-5 text-center">
              <AlertCircle className="mx-auto size-8 text-destructive" />
              <p className="mt-2 font-semibold">{state.error}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="hero" onClick={start}><RotateCcw /> إعادة المحاولة</Button>
                <Button variant="outline" onClick={reset}>اختيار ملف آخر</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {state.status === "done" && <Results file={state.file} kind={state.media.kind} result={state.result} onReset={reset} />}

      <p className="mt-4 flex items-center justify-center gap-2 px-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-lilac-600" />
        ملفاتك لا تُرفع إلى أي خادم؛ تُعالج داخل متصفحك وتُحذف من الذاكرة فور إغلاق الصفحة أو اختيار ملف جديد.
      </p>
    </div>
  );
}

function Steps({ current }: { current: number }) {
  const items = ["رفع الملف", "المعالجة", "النتيجة"];
  return (
    <ol className="flex items-center justify-center gap-2 px-2 pt-2 sm:gap-4">
      {items.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <span className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm", active ? "bg-lilac-100 text-lilac-800" : done ? "text-lilac-600" : "text-muted-foreground")}>
              <span className={cn("grid size-6 place-items-center rounded-full text-xs", active || done ? "bg-brand text-primary-foreground" : "bg-lilac-50")}>
                {done ? <Check className="size-3.5" /> : n}
              </span>
              {label}
            </span>
            {n < items.length && <span className="h-px w-4 bg-lilac-100 sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}

function FileCard({ file, kind, onChange }: { file: File; kind: "audio" | "video"; onChange?: (() => void) | undefined }) {
  const Icon = kind === "video" ? FileVideo : FileAudio;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-lilac-100 bg-card p-4 shadow-soft">
      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-lilac-50">
        <Icon className="size-6 text-lilac-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold" dir="auto" title={file.name}>{file.name}</p>
        <p className="text-sm text-muted-foreground">
          {kind === "video" ? "فيديو" : "صوت"} · {formatBytes(file.size)}
        </p>
      </div>
      {onChange && (
        <Button variant="ghost" size="sm" onClick={onChange}>تغيير</Button>
      )}
    </div>
  );
}

function Progress({ stage, progress, detail, onCancel }: { stage: Stage; progress: number | null; detail?: string | undefined; onCancel: () => void }) {
  const activeIndex = STAGES.findIndex((s) => s.key.includes(stage));
  return (
    <div className="rounded-2xl border border-lilac-100 bg-card p-5 shadow-soft sm:p-6" aria-live="polite">
      <div className="flex items-center justify-center">
        <SoundWave className="h-12" bars={15} />
      </div>
      <p className="mt-4 text-center text-lg font-bold">{STAGE_TEXT[stage]}</p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-lilac-50" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress != null ? Math.round(progress * 100) : undefined}>
        {progress != null ? (
          <div className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out" style={{ width: `${Math.max(2, progress * 100)}%` }} />
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            <div className="animate-shimmer absolute inset-y-0 w-1/3 rounded-full bg-brand" />
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{detail ?? "\u00a0"}</span>
        <span>{progress != null ? `${Math.round(progress * 100)}%` : ""}</span>
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {STAGES.map((s, i) => (
          <li key={s.label} className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-sm", i === activeIndex ? "bg-lilac-50 font-semibold text-foreground" : i < activeIndex ? "text-lilac-600" : "text-muted-foreground")}>
            {i < activeIndex ? <Check className="size-4" /> : i === activeIndex ? <Loader2 className="size-4 animate-spin" /> : <span className="size-4 rounded-full border border-lilac-100" />}
            {s.label}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        أبقِ هذه الصفحة مفتوحة. تعتمد السرعة على قوة جهازك.
      </p>
      <div className="mt-3 flex justify-center">
        <Button variant="ghost" size="sm" onClick={onCancel}>إلغاء</Button>
      </div>
    </div>
  );
}

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 60) || "file";
}

function download(blob: Blob | string, filename: string) {
  const a = document.createElement("a");
  a.href = typeof blob === "string" ? blob : URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof blob !== "string") setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function Results({ file, kind, result, onReset }: { file: File; kind: "audio" | "video"; result: ResultUrls; onReset: () => void }) {
  const name = baseName(file.name);
  const [busy, setBusy] = useState<string | null>(null);

  const mp3 = async (which: "vocals" | "music") => {
    setBusy(which);
    try {
      const { wavToMp3 } = await import("@/lib/media/ffmpeg");
      const blob = await wavToMp3(which === "vocals" ? result.vocalsWav : result.musicWav);
      download(blob, `${name}_${which}.mp3`);
    } catch (e) {
      console.error(e);
      toast.error("تعذّر تحويل الملف إلى MP3. يمكنك تنزيل نسخة WAV.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-3 space-y-4 rounded-[1.5rem] bg-soft p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-full bg-brand shadow-glow">
          <Check className="size-6 text-primary-foreground" />
        </span>
        <h3 className="mt-3 text-2xl font-bold">تم فصل الصوت بنجاح</h3>
        <p className="text-sm text-muted-foreground">المدة {formatDuration(result.duration)} — قارن واستمع ثم نزّل ما تحتاجه</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Player title="الملف الأصلي" icon={kind === "video" ? Film : AudioLines}>
          {kind === "video" ? (
            <video src={result.original} controls playsInline preload="metadata" className="aspect-video w-full rounded-xl bg-lilac-800" />
          ) : (
            <audio src={result.original} controls preload="metadata" className="w-full" />
          )}
        </Player>
        <Player title={kind === "video" ? "الفيديو بدون موسيقى" : "الصوت البشري فقط"} icon={Mic2} highlight>
          {kind === "video" && result.video ? (
            <video src={result.video} controls playsInline preload="metadata" className="aspect-video w-full rounded-xl bg-lilac-800" />
          ) : (
            <audio src={result.vocals} controls preload="metadata" className="w-full" />
          )}
        </Player>
        <Player title="الموسيقى المنفصلة" icon={Music2} className="lg:col-span-2">
          <audio src={result.music} controls preload="metadata" className="w-full" />
        </Player>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DownloadGroup title="الصوت البشري" icon={Mic2}>
          <Button variant="hero" className="flex-1" onClick={() => download(result.vocalsWav, `${name}_vocals.wav`)}><Download /> WAV</Button>
          <Button variant="soft" className="flex-1" disabled={busy !== null} onClick={() => mp3("vocals")}>
            {busy === "vocals" ? <Loader2 className="animate-spin" /> : <Download />} MP3
          </Button>
        </DownloadGroup>
        <DownloadGroup title="الموسيقى وحدها" icon={Music2}>
          <Button variant="outline" className="flex-1" onClick={() => download(result.musicWav, `${name}_music.wav`)}><Download /> WAV</Button>
          <Button variant="soft" className="flex-1" disabled={busy !== null} onClick={() => mp3("music")}>
            {busy === "music" ? <Loader2 className="animate-spin" /> : <Download />} MP3
          </Button>
        </DownloadGroup>
        {result.videoBlob && (
          <DownloadGroup title="الفيديو بعد إزالة الموسيقى" icon={Film} className="sm:col-span-2">
            <Button variant="hero" size="lg" className="flex-1" onClick={() => download(result.videoBlob!, `${name}_no_music.${result.videoExt}`)}>
              <Download /> تنزيل الفيديو ({result.videoExt?.toUpperCase()})
            </Button>
          </DownloadGroup>
        )}
      </div>

      <div className="flex justify-center pt-1">
        <Button variant="outline" size="lg" onClick={onReset}><RotateCcw /> معالجة ملف جديد</Button>
      </div>
    </div>
  );
}

function Player({ title, icon: Icon, children, highlight, className }: { title: string; icon: typeof Mic2; children: React.ReactNode; highlight?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-4 shadow-soft transition-shadow hover:shadow-lift", highlight ? "border-lilac-400" : "border-lilac-100", className)}>
      <p className="mb-3 flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-lilac-600" /> {title}
        {highlight && <span className="ms-auto rounded-full bg-lilac-100 px-2 py-0.5 text-xs text-lilac-800">النتيجة</span>}
      </p>
      {children}
    </div>
  );
}

function DownloadGroup({ title, icon: Icon, children, className }: { title: string; icon: typeof Mic2; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-lilac-100 bg-card p-4 shadow-soft", className)}>
      <p className="mb-3 flex items-center gap-2 text-sm font-bold"><Icon className="size-4 text-lilac-600" /> {title}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}
