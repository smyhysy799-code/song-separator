import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#top", label: "الرئيسية" },
  { href: "/#how", label: "كيف يعمل؟" },
  { href: "/#features", label: "المميزات" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-lilac-100/80 px-4 py-2.5 shadow-soft sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="صوتي — الصفحة الرئيسية">
          <Logo />
        </Link>
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-lilac-50 hover:text-foreground">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Button asChild variant="hero" size="sm" className="hidden px-5 sm:inline-flex">
            <a href="/#studio">ابدأ الآن</a>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>
      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl rounded-2xl border border-lilac-100 p-3 shadow-lift md:hidden animate-in fade-in slide-in-from-top-2">
          <ul className="flex flex-col">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-base font-medium hover:bg-lilac-50">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Button asChild variant="hero" size="lg" className="mt-2 w-full">
            <a href="/#studio" onClick={() => setOpen(false)}>ابدأ الآن</a>
          </Button>
        </div>
      )}
    </header>
  );
}
