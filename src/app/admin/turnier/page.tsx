"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminBracket from "./AdminBracket";

interface Player {
  id: string;
  name: string;
  username: string;
  group_name: string | null;
}

export default function TurnierAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.push("/");
    } else if (status === "authenticated") {
      fetchGroups();
    }
  }, [status, router, session]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/turnier/groups");
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGroups = async () => {
    if (!confirm("Bist du sicher? Alle bestehenden Gruppen werden durch zufällige neue Gruppen ersetzt!")) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/turnier/groups/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("Gruppen wurden erfolgreich generiert!");
        fetchGroups();
      } else {
        alert("Fehler: " + data.message);
      }
    } catch (err) {
      alert("Fehler beim Generieren");
    } finally {
      setGenerating(false);
    }
  };

  const handleMovePlayer = async (userId: string, newGroupName: string) => {
    try {
      const res = await fetch("/api/admin/turnier/groups/move", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newGroupName })
      });
      if (res.ok) fetchGroups();
      else alert("Fehler beim Verschieben");
    } catch (err) {
      alert("Fehler beim Verschieben");
    }
  };

  const groupedPlayers = players.reduce((acc, player) => {
    const group = player.group_name || "Ohne Gruppe";
    if (!acc[group]) acc[group] = [];
    acc[group].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  const groupKeys = Object.keys(groupedPlayers).sort();
  const assignedGroups = groupKeys.filter(g => g !== "Ohne Gruppe");
  const unassignedGroup = groupKeys.includes("Ohne Gruppe") ? groupedPlayers["Ohne Gruppe"] : null;

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen px-4">
        <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-4 pb-20 pt-12">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-stone-800 flex items-center gap-3">
               🏆 Turnier-Verwaltung
            </h1>
            <p className="text-stone-500 mt-1 font-medium">Organisiere die Gruppenphase und K.O. Runden</p>
          </div>
          <button 
            onClick={() => router.push("/admin")}
            className="px-6 py-3 border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 rounded-xl font-bold transition-colors shadow-sm"
          >
            Zurück zur Übersicht
          </button>
        </div>

        {/* Gruppenphase */}
        <div className="glass-card rounded-3xl p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Gruppenphase</h2>
              <p className="text-stone-500 mt-1 text-sm">Mindestens 2 Personen pro Gruppe. Zuteilung erfolgt zufällig.</p>
            </div>
            <button
               onClick={handleGenerateGroups}
               disabled={generating}
               className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
            >
               {generating ? "Generiere..." : "Gruppen automatisch auslosen"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedGroups.map(group => (
               <div key={group} className="bg-white/60 border border-stone-100 shadow-sm rounded-2xl p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-orange-600 bg-orange-50 inline-block px-3 py-1 rounded-lg">Gruppe {group}</h3>
                    <span className="text-sm font-bold text-stone-400">{groupedPlayers[group].length} Spieler</span>
                 </div>
                 <ul className="space-y-3">
                   {groupedPlayers[group].map(p => (
                     <li key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-100 shadow-sm gap-2">
                       <div>
                         <p className="font-bold text-stone-800">{p.name}</p>
                         <p className="text-xs text-stone-400">@{p.username}</p>
                       </div>
                       <select 
                         value={group}
                         onChange={(e) => handleMovePlayer(p.id, e.target.value)}
                         className="text-sm bg-stone-50 border border-stone-200 text-stone-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                       >
                         {assignedGroups.map(g => (
                           <option key={g} value={g}>Zu Grp. {g}</option>
                         ))}
                       </select>
                     </li>
                   ))}
                 </ul>
               </div>
            ))}
          </div>

          {unassignedGroup && unassignedGroup.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-6 mt-6">
              <h3 className="text-lg font-bold text-stone-500 mb-4 inline-flex items-center gap-2">
                Ohne Gruppe <span className="text-xs bg-stone-200 text-stone-600 px-2 rounded-full">{unassignedGroup.length}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {unassignedGroup.map(p => (
                   <div key={p.id} className="bg-white px-3 py-1.5 rounded-lg border border-stone-200 text-sm flex items-center gap-2 shadow-sm">
                     <span className="font-medium text-stone-700">{p.name}</span>
                   </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* K.O. Phase */}
        <AdminBracket players={players} />

      </div>
    </main>
  );
}
