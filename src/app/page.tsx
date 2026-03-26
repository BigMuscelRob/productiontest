import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center px-4 pb-20">
      {/* ── HERO ── */}
      <section
        className="w-full max-w-4xl mx-auto text-center pt-20 pb-16"
        aria-labelledby="hero-heading"
      >


        {/* Main Heading */}
        <h1
          id="hero-heading"
          className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6"
        >
          <span className="gradient-text">TT-Tournament</span>
          <br />
          <span
            className="text-stone-800"
            style={{ fontSize: "0.75em" }}
          >
            2026
          </span>
        </h1>

        {/* Welcome text */}
        <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Willkommen beim offiziellen Tischtennis-Turnier 2026! Erlebe packende Matches,
          verfolge die Gruppenphase und fiebere beim Turnierfinale mit. Melde dich jetzt an
          und zeig, was du drauf hast!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/registrierung"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-base shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
              boxShadow: "0 4px 20px rgba(249,115,22,0.35)",
            }}
          >
            Jetzt anmelden
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
            </svg>
          </Link>
          <Link
            href="/spieler"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-105 active:scale-95 glass-card"
            style={{ color: "#c2410c" }}
          >
            Spieler ansehen
          </Link>
        </div>
      </section>

      {/* ── INFO CARDS ── */}
      <section
        className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
        aria-label="Turnier-Informationen"
      >
        {/* Regelwerk */}
        <article
          className="glass-card rounded-3xl p-6 flex flex-col gap-4"
          aria-labelledby="rules-heading"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.08))",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
              aria-hidden="true"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <line x1="9" y1="12" x2="15" y2="12"/>
                <line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
            </span>
            <h2 id="rules-heading" className="text-xl font-bold text-stone-800">
              Regelwerk
            </h2>
          </div>

          {/* Key rules – icon rows */}
          <div className="flex flex-col gap-2">
            {[
              { icon: "🏓", label: "Modus", value: "Best of 3 Sätze" },
              { icon: "🔢", label: "Punkte/Satz", value: "11 Punkte" },
              { icon: "⚖️", label: "Gleichstand", value: "Satzdifferenz entscheidet" },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)" }}
              >
                <span className="text-lg flex-shrink-0">{icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide leading-none mb-0.5">{label}</span>
                  <span className="text-sm text-stone-700 font-medium">{value}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="w-full h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(249,115,22,0.2), transparent)" }}
          />
          <p className="text-xs text-stone-400 text-center">🤝 Fairplay first</p>
        </article>

        {/* Turnierablauf */}
        <article
          className="glass-card rounded-3xl p-6 flex flex-col gap-4"
          aria-labelledby="format-heading"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <span
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.08))",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
              aria-hidden="true"
            >
              {/* Inline bracket SVG logo */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" y1="5" x2="7" y2="5"/>
                <line x1="2" y1="11" x2="7" y2="11"/>
                <line x1="7" y1="5" x2="7" y2="11"/>
                <line x1="7" y1="8" x2="12" y2="8"/>
                <line x1="2" y1="17" x2="7" y2="17"/>
                <line x1="2" y1="23" x2="7" y2="23"/>
                <line x1="7" y1="17" x2="7" y2="23"/>
                <line x1="7" y1="20" x2="12" y2="20"/>
                <line x1="12" y1="8" x2="12" y2="20"/>
                <line x1="12" y1="14" x2="17" y2="14"/>
                <circle cx="19" cy="14" r="2" fill="#ea580c" stroke="none"/>
              </svg>
            </span>
            <h2 id="format-heading" className="text-xl font-bold text-stone-800">
              Turnierablauf
            </h2>
          </div>

          {/* Flow: Phase badges */}
          <div className="flex flex-col items-center gap-2">
            {[
              { icon: "🗂️", label: "Gruppenphase", color: "#f97316" },
              { icon: "⚔️", label: "K.O. Runde", color: "#ea580c" },
              { icon: "🥇", label: "Finale", color: "#c2410c" },
            ].map(({ icon, label, color }, i, arr) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white whitespace-nowrap shadow-sm"
                  style={{ background: color }}
                >
                  <span>{icon}</span>
                  {label}
                </span>
                {i < arr.length - 1 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M6 13l6 6 6-6"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* ── STATS STRIP ── */}
      <section
        className="w-full max-w-4xl mx-auto mt-10 glass rounded-3xl px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center"
        aria-label="Turnier Statistiken"
      >
        {[
          { value: "32", label: "Spieler", icon: "👥" },
          { value: "8", label: "Gruppen", icon: "🗂️" },
          { value: "1", label: "Champion", icon: "🥇" },
        ].map(({ value, label, icon }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-2xl" aria-hidden="true">{icon}</span>
            <span className="text-3xl font-black gradient-text">{value}</span>
            <span className="text-sm text-stone-500 font-medium">{label}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
