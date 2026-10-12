import { AudioWaveform, Cpu, Download, FileAudio2, Gem, Languages, Lock, MousePointerClick, Sparkles, UploadCloud, Wand2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { SoundWave } from "./SoundWave";

export function Hero() {
  return (
    <section id="top" className="bg-hero relative overflow-hidden px-4 pb-16 pt-32 sm:pt-40">
      <svg aria-hidden viewBox="0 0 1200 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-60">
        <path d="M0 120 C 150 60, 300 180, 450 110 S 750 40, 900 110 S 1100 170, 1200 100" className="fill-none stroke-lilac" strokeWidth="2" />
        <path d="M0 140 C 200 90, 350 190, 520 130 S 820 70, 960 130 S 1120 180, 1200 130" className="fill-none stroke-lilac-100" strokeWidth="2" />
      </svg>
      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-lilac-100 bg-card/70 px-4 py-1.5 text-sm font-medium text-lilac-600 shadow-soft">
            <Sparkles className="size-4" /> مدعوم بنموذج Demucs مفتوح المصدر
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="text-gradient mt-6 text-4xl font-extrabold leading-[1.35] sm:text-6xl sm:leading-[1.3]">
            صوتك بوضوح... وموسيقاك باختيارك
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            افصل الموسيقى عن الصوت البشري في أغانيك ومقاطع الفيديو بسهولة، باستخدام تقنيات الذكاء الاصطناعي المتقدمة.
          </p>
        </Reveal>
        <Reveal delay={240} className="mt-8 flex flex-col items-center gap-6">
          <Button asChild variant="hero" size="xl">
            <a href="#studio">ابدأ فصل الموسيقى ✨</a>
          </Button>
          <SoundWave className="animate-float h-14" />
        </Reveal>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: UploadCloud, title: "ارفع ملفك", text: "اسحب أغنية أو فيديو إلى البطاقة، أو اختره من هاتفك أو جهازك." },
  { icon: Wand2, title: "ابدأ المعالجة", text: "يحلل نموذج الذكاء الاصطناعي الصوت ويفصل الغناء والكلام عن الموسيقى." },
  { icon: Download, title: "استمع ونزّل", text: "قارن بين الأصلي والنتيجة، ثم نزّل الصوت أو الموسيقى أو الفيديو." },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="ثلاث خطوات فقط" title="كيف يعمل الموقع؟" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className="group relative h-full rounded-3xl border border-lilac-100 bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="absolute left-6 top-6 text-5xl font-extrabold text-lilac-50">{i + 1}</span>
                <span className="grid size-14 place-items-center rounded-2xl bg-brand shadow-glow transition-transform group-hover:scale-105">
                  <s.icon className="size-7 text-primary-foreground" strokeWidth={1.7} />
                </span>
                <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: AudioWaveform, title: "فصل ذكي للصوت", text: "نموذج HT‑Demucs المدرَّب على فصل الغناء يحافظ على وضوح الكلمات." },
  { icon: FileAudio2, title: "صوت وفيديو", text: "MP3 وWAV وM4A وFLAC، وفيديو MP4 وMOV وWebM مع إعادة دمج الصوت." },
  { icon: MousePointerClick, title: "سهولة الاستخدام", text: "ثلاث خطوات واضحة من الرفع إلى التنزيل، على الجوال والكمبيوتر." },
  { icon: Gem, title: "جودة محفوظة", text: "صوت 44.1 كيلوهرتز ستيريو، والصورة تُنسخ كما هي دون إعادة ضغط." },
  { icon: Lock, title: "خصوصية وأمان", text: "لا يغادر ملفك جهازك أبدًا؛ المعالجة كلها داخل متصفحك." },
  { icon: Languages, title: "واجهة عربية احترافية", text: "تصميم عربي بالكامل من اليمين إلى اليسار، بخط Cairo Play." },
];

export function Features() {
  return (
    <section id="features" className="bg-soft scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="المميزات" title="لماذا تختار منصتنا؟" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="group h-full rounded-3xl border border-lilac-100 bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-lilac hover:shadow-lift">
                <span className="grid size-12 place-items-center rounded-2xl bg-lilac-50 transition-colors group-hover:bg-lilac-100">
                  <f.icon className="size-6 text-lilac-600" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-muted-foreground">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  { q: "هل الخدمة مجانية؟", a: "نعم، مجانية بالكامل. المعالجة تتم على جهازك باستخدام نموذج مفتوح المصدر، لذلك لا توجد تكاليف خوادم." },
  { q: "هل تُرفع ملفاتي إلى خادم؟", a: "لا. يُقرأ الملف ويُعالج داخل متصفحك فقط، ولا يُرسل إلى أي خادم. تُحذف النتائج من الذاكرة عند اختيار ملف جديد أو إغلاق الصفحة." },
  { q: "لماذا تستغرق المعالجة الأولى وقتًا أطول؟", a: "في أول استخدام يُنزَّل نموذج الذكاء الاصطناعي (حوالي 166 ميجابايت) ويُحفظ في متصفحك، فتكون المرات التالية أسرع." },
  { q: "كم تستغرق معالجة أغنية؟", a: "يعتمد ذلك على قوة جهازك. على كمبيوتر حديث قد تستغرق أغنية مدتها 4 دقائق بضع دقائق. الهواتف أبطأ، ويُفضّل استخدامها مع ملفات أقصر." },
  { q: "هل يتم حذف الصوت بالكامل من الفيديو؟", a: "لا، تُزال الموسيقى فقط ويُحتفظ بالغناء والكلام، ثم يُدمج مع الصورة الأصلية بنفس دقتها." },
  { q: "ما الحدود المسموحة؟", a: "حتى 300 ميجابايت ومدة 10 دقائق لكل ملف، حفاظًا على ذاكرة جهازك." },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionTitle eyebrow="لديك سؤال؟" title="الأسئلة الشائعة" />
        <Reveal className="mt-10">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`} className="rounded-2xl border border-lilac-100 bg-card px-5 shadow-soft">
                <AccordionTrigger className="text-start text-base font-bold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-base leading-8 text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="text-center">
      <p className="text-sm font-semibold text-lilac-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h2>
    </Reveal>
  );
}

export function EngineNote() {
  return (
    <p className="mx-auto mt-4 flex max-w-xl items-center justify-center gap-2 text-center text-xs text-muted-foreground">
      <Cpu className="size-4 shrink-0" /> يعمل الذكاء الاصطناعي على معالج جهازك عبر WebAssembly
    </p>
  );
}
