"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistrierungPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Ein Fehler ist aufgetreten.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Ein Netzwerkfehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex flex-col items-center px-4 pb-20 pt-12">
        <div className="w-full max-w-md mx-auto">
          <div className="glass-card rounded-3xl p-10 flex flex-col items-center gap-6 text-center bg-green-50/50 border-green-200">
            <span className="text-5xl">🎉</span>
            <div>
              <h1 className="text-2xl font-black text-stone-800">Registrierung erfolgreich!</h1>
              <p className="text-stone-500 mt-2">
                Dein Account wurde erstellt. Du kannst dich jetzt anmelden.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full mt-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
            >
              Zum Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-4 pb-20 pt-12">
      <div className="w-full max-w-md mx-auto">
        <div className="glass-card rounded-3xl p-10 text-center flex flex-col items-center gap-6">
          <span className="text-5xl">📝</span>
          <div>
            <h1 className="text-3xl font-black text-stone-800">Registrierung</h1>
            <p className="text-stone-500 max-w-sm mt-2">
              Melde dich jetzt für das Turnier an.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
                {error}
              </div>
            )}
            
             <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-stone-700 ml-1">Vollständiger Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                placeholder="Max Mustermann"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-stone-700 ml-1">Benutzername (Nickname)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                placeholder="maxi99"
              />
              <p className="text-xs text-stone-500 ml-1">Dieser Name wird z.B. im Turnierbaum angezeigt.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-stone-700 ml-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                placeholder="Mindestens 6 Zeichen"
              />
            </div>

             <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-stone-700 ml-1">Passwort bestätigen</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                placeholder="Passwort wiederholen"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-stone-800 hover:bg-stone-900 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? "Wird registriert..." : "Kostenlos registrieren"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
