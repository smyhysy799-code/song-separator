import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-lilac-100 bg-card px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            منصة عربية مجانية لفصل الموسيقى عن الصوت البشري بالذكاء الاصطناعي، مع خصوصية كاملة.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3" aria-label="روابط التذييل">
          <a href="/#top" className="text-muted-foreground hover:text-foreground">الرئيسية</a>
          <a href="/#how" className="text-muted-foreground hover:text-foreground">كيف يعمل؟</a>
          <a href="/#features" className="text-muted-foreground hover:text-foreground">المميزات</a>
          <a href="/#faq" className="text-muted-foreground hover:text-foreground">الأسئلة الشائعة</a>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground">سياسة الخصوصية</Link>
        </nav>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-lilac-50 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} صوتي. جميع الحقوق محفوظة.</p>
        <p>نموذج الفصل: HT‑Demucs من Meta (رخصة MIT).</p>
      </div>
    </footer>
  );
}
