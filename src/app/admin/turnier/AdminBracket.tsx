"use client";

import { useState, useEffect } from "react";

type Match = {
  id: string;
  phase: string;
  bracket_position: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  status: string;
  player1_name: string | null;
  player2_name: string | null;
};

type Player = {
  id: string;
  name: string;
  username: string;
  group_name: string | null;
};

const PHASES_ORDER = [
  "sechzehntelfinale",
  "achtelfinale",
  "viertelfinale",
  "halbfinale",
  "finale"
];

const PHASE_NAMES: Record<string, string> = {
  sechzehntelfinale: "1/16 Finale",
  achtelfinale: "Achtelfinale",
  viertelfinale: "Viertelfinale",
  halbfinale: "Halbfinale",
  finale: "Finale"
};

export default function AdminBracket({ players }: { players: Player[] }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchBracket = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/turnier/bracket");
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBracket();
  }, []);

  const handleGenerate = async () => {
    if (matches.length > 0) {
      if (!confirm("Achtung! Es existiert bereits ein K.O. Baum. Wenn du fortfährst, wird der alte Baum samt Ergebnissen unwiderruflich gelöscht. Wirklich neu generieren?")) return;
    } else {
      if (!confirm("Möchtest du die K.O. Phase jetzt basierend auf den ersten 2 Spielern aus jeder Gruppe generieren?")) return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/admin/turnier/bracket/generate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("Bracket erfolgreich generiert!");
        fetchBracket();
      } else {
        alert("Fehler: " + data.message);
      }
    } catch (err) {
      alert("Fehler beim Generieren des Brackets.");
    } finally {
      setGenerating(false);
    }
  };

  const updateMatchPlayer = async (matchId: string, playerKey: 'player1_id' | 'player2_id', newPlayerId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const payload = {
      matchId,
      player1Id: playerKey === 'player1_id' ? newPlayerId : match.player1_id,
      player2Id: playerKey === 'player2_id' ? newPlayerId : match.player2_id,
    };

    try {
      const res = await fetch("/api/admin/turnier/bracket", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchBracket();
      } else {
        alert("Fehler beim Speichern");
      }
    } catch (err) {
      alert("Netzwerkfehler");
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Lade Bracket...</div>;

  const activePhases = PHASES_ORDER.filter(phase => matches.some(m => m.phase === phase));
  const grouped: Record<string, Match[]> = {};
  matches.forEach(m => {
    if (!grouped[m.phase]) grouped[m.phase] = [];
    grouped[m.phase].push(m);
  });
  Object.keys(grouped).forEach(k => grouped[k].sort((a, b) => a.bracket_position - b.bracket_position));

  const finaleMatch = grouped['finale'] ? grouped['finale'][0] : null;
  const leftPhases = activePhases.filter(p => p !== 'finale');
  const rightPhases = [...leftPhases].reverse();

  const PlayerSelect = ({ matchId, playerKey, currentValue }: { matchId: string, playerKey: 'player1_id' | 'player2_id', currentValue: string | null }) => (
    <select
      value={currentValue || ""}
      onChange={e => updateMatchPlayer(matchId, playerKey, e.target.value)}
      className="w-full text-sm bg-stone-50 border border-stone-200 text-stone-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-orange-500 font-medium truncate"
    >
      <option value="">-- Spieler wählen --</option>
      {players.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );

  const AdminMatchCard = ({ match }: { match: Match }) => (
    <div className="relative glass-card bg-white/80 rounded-xl p-3 shadow-md border border-stone-200 min-w-[200px]">
      <div className="flex flex-col gap-2">
        <PlayerSelect matchId={match.id} playerKey="player1_id" currentValue={match.player1_id} />
        <div className="h-px bg-stone-100 w-full" />
        <PlayerSelect matchId={match.id} playerKey="player2_id" currentValue={match.player2_id} />
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-3xl p-8 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">K.O. Phase</h2>
          <p className="text-stone-500 mt-1 text-sm">Verwalte den Turnierbaum. Spieler können in den Slots manuell angepasst werden.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full md:w-auto bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 whitespace-nowrap"
        >
          {generating ? "Generiere..." : "K.O. Baum (neu) generieren"}
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
          <p className="text-stone-500">Noch kein K.O. Baum erstellt.</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-12 pt-4 px-4">
          <div className="flex flex-col lg:flex-row items-stretch gap-8 min-w-max mx-auto w-max">
            
            {/* Left Wing */}
            <div className="flex flex-row items-center gap-6 shrink-0">
              {leftPhases.map((phase) => {
                const phaseMatches = grouped[phase] || [];
                const halfIndex = Math.ceil(phaseMatches.length / 2);
                const leftMatches = phaseMatches.slice(0, halfIndex);
                return (
                  <div key={'l-'+phase} className="flex flex-col justify-around gap-6 py-4">
                     <h3 className="text-center text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 py-1 rounded-lg mb-2">
                        {PHASE_NAMES[phase]}
                     </h3>
                     {leftMatches.map((m) => <AdminMatchCard key={m.id} match={m} />)}
                  </div>
                );
              })}
            </div>

            {/* Center (Finale) */}
            {finaleMatch && (
              <div className="flex flex-col items-center justify-center shrink-0 px-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🥇</span>
                    <h3 className="text-xl font-black text-stone-800 tracking-wide uppercase">Finale</h3>
                    <span className="text-2xl">🥇</span>
                  </div>
                  <div className="transform scale-110">
                    <AdminMatchCard match={finaleMatch} />
                  </div>
              </div>
            )}

            {/* Right Wing */}
            <div className="flex flex-row items-center gap-6 shrink-0">
              {rightPhases.map((phase) => {
                const phaseMatches = grouped[phase] || [];
                const halfIndex = Math.ceil(phaseMatches.length / 2);
                const rightMatches = phaseMatches.slice(halfIndex);
                return (
                  <div key={'r-'+phase} className="flex flex-col justify-around gap-6 py-4">
                     <h3 className="text-center text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 py-1 rounded-lg mb-2">
                        {PHASE_NAMES[phase]}
                     </h3>
                     {rightMatches.map((m) => <AdminMatchCard key={m.id} match={m} />)}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
