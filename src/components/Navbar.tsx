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
  ];

  if (status === "unauthenticated") {
    navLinks.push({ href: "/login", label: "Login" });
    navLinks.push({ href: "/registrierung", label: "Registrierung" });
  }

  if (session?.user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin" });
  }

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "pt-0 px-0" : "pt-4 px-4"
      }`}
    >
      <nav
        className={`mx-auto flex items-center justify-between transition-all duration-300 ${
          isScrolled 
            ? "max-w-full px-6 lg:px-12 py-3 bg-white/70 backdrop-blur-xl border-b border-stone-200 shadow-sm" 
            : "max-w-5xl px-6 py-3 glass rounded-2xl"
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
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="gradient-text font-extrabold tracking-tight hidden sm:inline">
            TT-Tournament
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-4">
          <ul className="flex items-center gap-1" role="list">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
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
              <span className="text-sm font-medium text-stone-600 hidden md:inline-block">
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
      </nav>
    </header>
  );
}
