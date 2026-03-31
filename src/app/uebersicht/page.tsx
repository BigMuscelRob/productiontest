"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PlayerStandingsTable from "@/components/PlayerStandingsTable";

type Match = {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player1_username: string;
  player2_name: string;
  player2_username: string;
  status: string;
};

export default function UebersichtPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchNextMatch();
  }, []);

  async function fetchNextMatch() {
    setIsLoadingMatch(true);
    try {
      const res = await fetch("/api/matches/next");
      if (res.ok) {
        const data = await res.json();
        setNextMatch(data.match);
      }
    } catch (error) {
      console.error("Failed to load next match", error);
    } finally {
      setIsLoadingMatch(false);
    }
  }

  async function handleStartMatch() {
    if (!nextMatch) return;
    setIsStarting(true);
    try {
      const res = await fetch("/api/matches/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: nextMatch.id })
      });
      if (res.ok) {
        // Redirection should route the user immediately to the live match
        router.push(`/match/${nextMatch.id}`);
      }
    } catch (error) {
      console.error("Failed to start match", error);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <main className="flex flex-col items-center px-4 pb-20 pt-12">
      <div className="w-full max-w-5xl mx-auto space-y-12">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🏆</span>
          <h1 className="text-3xl font-black text-stone-800">Turnierübersicht</h1>
          <p className="text-stone-500 mt-2">Das nächste Match und alle Spieler-Statistiken.</p>
        </div>

        {/* Next Match Section */}
        <section className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-orange-500 h-full"></div>
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Anstehendes Match
          </h2>
          
          {isLoadingMatch ? (
             <div className="flex justify-center p-4">
               <div className="w-6 h-6 rounded-full border-2 border-orange-200 border-t-orange-600 animate-spin"></div>
             </div>
          ) : nextMatch ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 p-6 rounded-2xl border border-stone-100">
              <div className="flex-1 flex justify-center flex-col items-center">
                <span className="text-stone-500 text-sm mb-1">Spieler 1</span>
                <span className="font-bold text-lg text-stone-800 block">{nextMatch.player1_name}</span>
                <span className="text-stone-400 text-xs">@{nextMatch.player1_username}</span>
              </div>
              
              <div className="flex-shrink-0 font-black text-stone-300 text-2xl italic">VS</div>
              
              <div className="flex-1 flex justify-center flex-col items-center">
                <span className="text-stone-500 text-sm mb-1">Spieler 2</span>
                <span className="font-bold text-lg text-stone-800 block">{nextMatch.player2_name}</span>
                <span className="text-stone-400 text-xs">@{nextMatch.player2_username}</span>
              </div>

              {(() => {
                const isParticipant = session?.user?.id === nextMatch.player1_id || session?.user?.id === nextMatch.player2_id;
                const isAdmin = session?.user?.role === 'admin';
                const canStart = isParticipant || isAdmin;

                if (!canStart) return null;

                return (
                  <div className="mt-4 md:mt-0 w-full md:w-auto">
                    <button 
                      onClick={handleStartMatch}
                      disabled={isStarting}
                      className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isStarting ? "Startet..." : "Match starten"}
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-4">Aktuell keine anstehenden Matches.</p>
          )}
        </section>

        {/* Standings Section */}
        <section>
          <h2 className="text-2xl font-bold text-stone-800 mb-6 px-2">Spieler Statistiken</h2>
          <PlayerStandingsTable />
        </section>
      </div>
    </main>
  );
}
