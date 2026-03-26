"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  mustChangePassword: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tempPasswordModal, setTempPasswordModal] = useState<{username: string, password: string} | null>(null);
  const [resetPrompt, setResetPrompt] = useState<{ id: string; username: string } | null>(null);
  const [customTempPassword, setCustomTempPassword] = useState("");
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Fehler beim Laden der Benutzer");
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError("Fehler beim Laden der Benutzer.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPrompt || !customTempPassword) return;
    
    const { id, username } = resetPrompt;
    setResettingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempPassword: customTempPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Fehler beim Zurücksetzen");
      
      setTempPasswordModal({ username, password: data.tempPassword });
      setResetPrompt(null);
      setCustomTempPassword("");
      fetchUsers(); // Refresh list to update mustChangePassword badge
    } catch (err: any) {
      alert(err.message || "Fehler beim Zurücksetzen des Passworts.");
    } finally {
      setResettingId(null);
    }
  };

  const openResetPrompt = (id: string, username: string) => {
    setResetPrompt({ id, username });
    setCustomTempPassword("");
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`WARNUNG: Soll der Benutzer ${username} wirklich ENDGÜLTIG gelöscht werden?`)) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Fehler beim Löschen");
      
      fetchUsers(); // Refresh list to remove deleted user
    } catch (err: any) {
      alert(err.message || "Fehler beim Löschen des Benutzers.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Lade Benutzer...</div>;
  }

  return (
    <main className="flex flex-col items-center px-4 pb-20 pt-12">
      <div className="w-full max-w-5xl mx-auto">
        <div className="glass-card rounded-3xl p-8 lg:p-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-stone-800 flex items-center gap-3">
                <span>🛡️</span> Admin Dashboard
              </h1>
              <p className="text-stone-500 mt-1">
                Verwalte alle registrierten Spieler und Administratoren.
              </p>
            </div>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="overflow-x-auto bg-white/40 rounded-2xl border border-stone-200/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200/50">
                  <th className="py-4 px-6 font-semibold text-stone-600">Name</th>
                  <th className="py-4 px-6 font-semibold text-stone-600">Benutzername</th>
                  <th className="py-4 px-6 font-semibold text-stone-600">Rolle</th>
                  <th className="py-4 px-6 font-semibold text-stone-600">Status</th>
                  <th className="py-4 px-6 font-semibold text-stone-600 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/30 transition-colors">
                    <td className="py-4 px-6 font-medium">{user.name}</td>
                    <td className="py-4 px-6 text-stone-600">@{user.username}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Passwort-Reset ausstehend
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-stone-500">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktiv
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openResetPrompt(user.id, user.username)}
                          disabled={resettingId === user.id || deletingId === user.id}
                          className="text-sm px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors disabled:opacity-50"
                        >
                          {resettingId === user.id ? "Wird zurückgesetzt..." : "Passwort zurücksetzen"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={deletingId === user.id || resettingId === user.id}
                          className="text-sm px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium transition-colors disabled:opacity-50"
                        >
                          {deletingId === user.id ? "Löscht..." : "Löschen"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">Keine Benutzer gefunden.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Reset Password Prompt Modal */}
      {resetPrompt && !tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-stone-200 relative">
            <button 
              onClick={() => setResetPrompt(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="text-center mb-6">
              <span className="text-4xl inline-block mb-2">🔄</span>
              <h2 className="text-xl font-bold text-stone-800">Passwort zurücksetzen</h2>
              <p className="text-sm text-stone-500 mt-1">
                Für Benutzer <strong>@{resetPrompt.username}</strong>
              </p>
            </div>
            
            <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-sm font-semibold text-stone-700 ml-1">Temporäres Passwort eingeben</label>
                <input
                  type="text"
                  value={customTempPassword}
                  onChange={(e) => setCustomTempPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono"
                  placeholder="z.B. Tischtennis2026!"
                />
              </div>

              <button
                type="submit"
                disabled={resettingId === resetPrompt.id || !customTempPassword}
                className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 mt-2"
              >
                {resettingId === resetPrompt.id ? "Wird gespeichert..." : "Passwort setzen"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Password Display Modal */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-stone-200">
            <div className="text-center mb-6">
              <span className="text-5xl inline-block mb-3">🔑</span>
              <h2 className="text-xl font-bold text-stone-800">Passwort zurückgesetzt</h2>
              <p className="text-sm text-stone-500 mt-1">
                Für Benutzer <strong>@{tempPasswordModal.username}</strong>
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center mb-6">
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Neues Temporäres Passwort</p>
              <p className="text-2xl font-mono font-bold text-stone-800 tracking-wider">
                {tempPasswordModal.password}
              </p>
            </div>

            <p className="text-xs text-stone-500 text-center mb-6">
              Bitte teile dieses Passwort dem Benutzer sicher mit. Der Benutzer muss das Passwort beim nächsten Login ändern.
            </p>

            <button
              onClick={() => setTempPasswordModal(null)}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
