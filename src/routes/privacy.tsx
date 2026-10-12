import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — صوتي" },
      { name: "description", content: "كيف يتعامل صوتي مع ملفاتك: المعالجة داخل متصفحك، دون رفع أو تخزين على أي خادم." },
      { property: "og:title", content: "سياسة الخصوصية — صوتي" },
      { property: "og:description", content: "ملفاتك لا تغادر جهازك. تعرّف على سياسة الخصوصية وحذف الملفات." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const ITEMS = [
  ["لا رفع للملفات", "تُقرأ ملفات الصوت والفيديو وتُعالج بالكامل داخل متصفحك. لا يتم إرسالها إلى أي خادم تابع لنا أو لأي طرف آخر."],
  ["الحذف التلقائي", "تبقى الملفات والنتائج في ذاكرة الصفحة فقط، وتُحذف فور اختيار ملف جديد أو الضغط على «معالجة ملف جديد» أو إغلاق الصفحة."],
  ["ما يُحفظ على جهازك", "يُحفظ نموذج الذكاء الاصطناعي فقط في ذاكرة المتصفح المؤقتة لتسريع الاستخدام التالي، ويمكنك حذفه بمسح بيانات الموقع."],
  ["خدمات خارجية", "يُنزَّل النموذج من Hugging Face، وتُنزَّل محركات التشغيل (ONNX Runtime وFFmpeg) من شبكة jsDelivr. لا تتلقى هذه الخدمات أي جزء من ملفاتك."],
  ["التحقق من الملفات", "نتحقق من نوع الملف الحقيقي من محتواه، ونرفض الملفات غير المدعومة أو التي تتجاوز 300 ميجابايت أو 10 دقائق."],
];

function Privacy() {
  return (
    <>
      <Navbar />
      <main className="bg-hero px-4 pb-20 pt-32">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-gradient text-4xl font-extrabold sm:text-5xl">سياسة الخصوصية</h1>
          <p className="mt-4 text-lg text-muted-foreground">خصوصيتك أولًا: ملفاتك لا تغادر جهازك.</p>
          <div className="mt-10 space-y-4">
            {ITEMS.map(([t, d]) => (
              <section key={t} className="rounded-3xl border border-lilac-100 bg-card p-6 shadow-soft">
                <h2 className="text-xl font-bold">{t}</h2>
                <p className="mt-2 leading-8 text-muted-foreground">{d}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
