"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Startseite" },
    { href: "/spieler", label: "Spieler" },
    { href: "/turnier", label: "Turnier" },
  ];

  if (status === "authenticated") {
    navLinks.splice(1, 0, { href: "/uebersicht", label: "Übersicht" });
  }

  if (status === "unauthenticated") {
    navLinks.push({ href: "/login", label: "Login" });
    navLinks.push({ href: "/registrierung", label: "Registrierung" });
  }

  if (session?.user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin" });
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out transform-gpu ${isScrolled ? "pt-0 px-0" : "pt-4 px-4"
        }`}
    >
      <nav
        className={`mx-auto flex items-center justify-between transition-all duration-500 ease-in-out transform-gpu ${isScrolled
          ? "max-w-full px-5 py-3 bg-white/90 backdrop-blur-2xl border-b border-stone-200/50 shadow-sm rounded-none"
          : "max-w-5xl px-5 py-3 bg-white/90 md:bg-white/55 backdrop-blur-2xl border border-stone-200/50 shadow-lg rounded-2xl"
          }`}
        aria-label="Hauptnavigation"
      >
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg select-none"
          aria-label="TT-Tournament 2026 – Startseite"
        >
          <Image
            src="/LogoTTT.png"
            alt="Tischtennis Uni Turnier Logo"
            width={48}
            height={48}
            className="rounded-xl shadow-sm"
            priority
          />
          <span className="gradient-text font-extrabold tracking-tight hidden sm:inline">
            TT-Tournament
          </span>
        </Link>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-4">
          <ul className="flex items-center gap-1" role="list">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? "text-orange-600 font-semibold"
                      : "text-stone-600 hover:text-orange-500"
                      }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <span
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,146,60,0.08))",
                          border: "1px solid rgba(249,115,22,0.2)",
                        }}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {status === "authenticated" && (
            <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
              <span className="text-sm font-medium text-stone-600">
                Hallo, <span className="text-orange-600">@{session.user?.email || session.user?.name}</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                title="Abmelden"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-stone-600 hover:text-orange-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full pt-2 px-4 shadow-2xl z-40">
          <div className="bg-white/95 backdrop-blur-3xl border border-stone-200 shadow-2xl rounded-2xl mx-auto p-5 flex flex-col gap-2">
            <ul className="flex flex-col gap-1.5" role="list">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block w-full px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive
                        ? "bg-orange-50 text-orange-600 font-semibold"
                        : "text-stone-600 hover:bg-stone-50 hover:text-orange-500"
                        }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {status === "authenticated" && (
              <div className="mt-2 pt-4 border-t border-stone-200">
                <div className="flex flex-col gap-3 px-4">
                  <span className="text-sm font-medium text-stone-600">
                    Angemeldet als <span className="text-orange-600">@{session.user?.email || session.user?.name}</span>
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-center text-sm px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
