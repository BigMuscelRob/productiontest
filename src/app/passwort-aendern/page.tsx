"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function PasswortAendernPage() {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Ein Fehler ist aufgetreten.");
      } else {
        setSuccess(true);
        // Force re-login or reload to refresh session token
        setTimeout(() => {
           signOut({ callbackUrl: '/login' });
        }, 3000);
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
            <span className="text-5xl">✅</span>
            <div>
              <h1 className="text-2xl font-black text-stone-800">Passwort geändert!</h1>
              <p className="text-stone-500 mt-2">
                Dein Passwort wurde erfolgreich aktualisiert. Du wirst in Kürze zum Login weitergeleitet...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-4 pb-20 pt-12">
      <div className="w-full max-w-md mx-auto">
        <div className="glass-card rounded-3xl p-10 text-center flex flex-col items-center gap-6 border-orange-300">
          <span className="text-5xl">🔐</span>
          <div>
            <h1 className="text-3xl font-black text-stone-800">Passwort ändern</h1>
            <p className="text-stone-500 max-w-sm mt-2">
              Ein Administrator hat dein Passwort zurückgesetzt. Bitte wähle nun ein neues sicheres Passwort.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-stone-700 ml-1">Neues Passwort</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                placeholder="Mindestens 6 Zeichen"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? "Wird gespeichert..." : "Passwort speichern"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
