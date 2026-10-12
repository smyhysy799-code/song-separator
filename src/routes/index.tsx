import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { EngineNote, Faq, Features, Hero, HowItWorks } from "@/components/site/Sections";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { Studio } from "@/components/studio/Studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "صوتي — افصل الموسيقى عن الصوت البشري بالذكاء الاصطناعي مجانًا" },
      { name: "description", content: "أزل الموسيقى من الأغاني ومقاطع الفيديو واحتفظ بالغناء والكلام، باستخدام نموذج Demucs داخل متصفحك وبخصوصية كاملة." },
      { property: "og:title", content: "صوتي — صوتك بوضوح... وموسيقاك باختيارك" },
      { property: "og:description", content: "فصل الموسيقى عن الصوت البشري في الصوتيات والفيديو بالذكاء الاصطناعي، مجانًا وداخل متصفحك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section id="studio" className="scroll-mt-24 px-3 pb-8 sm:px-4">
          <Reveal className="mx-auto -mt-6 max-w-4xl">
            <Studio />
            <EngineNote />
          </Reveal>
        </section>
        <HowItWorks />
        <Features />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
