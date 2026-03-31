"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type PlayerStat = {
  id: string;
  name: string;
  username: string;
  group_name: string | null;
  games_played: number;
  games_won: number;
  total_points_scored: number;
  total_points_conceded: number;
};

export default function PlayerStandingsTable({ grouped = true }: { grouped?: boolean }) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/players/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </div>
    );
  }

  if (stats.length === 0) {
    return <p className="text-center text-stone-500 py-8">Keine Spielerstatistiken vorhanden.</p>;
  }

  const renderTableRows = (players: PlayerStat[]) => {
    return players.map((player, index) => {
      const winRate = player.games_played > 0 
        ? Math.round((player.games_won / player.games_played) * 100) 
        : 0;
      const avgPoints = player.games_played > 0 
        ? (player.total_points_scored / player.games_played).toFixed(1)
        : "0.0";

      const isCurrentUser = session?.user?.id === player.id;

      return (
        <tr 
          key={player.id} 
          className={`transition-colors ${isCurrentUser ? "bg-orange-100/60 font-bold border-l-4 border-l-orange-500" : "hover:bg-orange-50/50"}`}
        >
          <td className={`px-5 py-4 text-center ${isCurrentUser ? "text-orange-900" : "font-bold text-stone-800"}`}>
            {index + 1}
          </td>
          <td className={`px-5 py-4 ${isCurrentUser ? "text-orange-900" : "font-medium text-stone-900"}`}>
            {player.name} 
            {isCurrentUser && <span className="text-orange-600 font-bold text-xs ml-2 uppercase tracking-widest bg-orange-200 px-2 py-0.5 rounded-full">Du</span>}
            <span className={`text-xs ml-1 ${isCurrentUser ? "text-orange-600/70" : "text-stone-400"}`}>@{player.username}</span>
          </td>
          <td className={`px-5 py-4 text-center ${isCurrentUser ? "text-orange-900" : "font-semibold text-stone-700"}`}>
            {player.games_played}
          </td>
          <td className={`px-5 py-4 text-center ${isCurrentUser ? "text-green-700" : "text-green-600 font-bold"}`}>
            {player.games_won}
          </td>
          <td className={`px-5 py-4 text-center ${isCurrentUser ? "text-orange-900" : "font-medium text-stone-600"}`}>
            {winRate}%
          </td>
          <td className={`px-5 py-4 text-center ${isCurrentUser ? "text-orange-900" : "font-medium text-stone-600"}`}>
            {avgPoints}
          </td>
        </tr>
      );
    });
  };

  const tableHeader = (
    <thead className="bg-stone-100/50 text-stone-600 font-medium border-b border-stone-200">
      <tr>
        <th className="px-5 py-4 w-16 text-center">Platz</th>
        <th className="px-5 py-4">Spieler</th>
        <th className="px-5 py-4 text-center">Spiele</th>
        <th className="px-5 py-4 text-center">Siege</th>
        <th className="px-5 py-4 text-center">Win %</th>
        <th className="px-5 py-4 text-center">⌀ Punkte</th>
      </tr>
    </thead>
  );

  if (!grouped) {
    return (
      <div className="w-full overflow-x-auto rounded-3xl border border-stone-200 bg-white/50 backdrop-blur-xl shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          {tableHeader}
          <tbody className="divide-y divide-stone-100">
            {renderTableRows(stats)}
          </tbody>
        </table>
      </div>
    );
  }

  // Gruppieren der Spieler nach group_name
  const groupedStats = stats.reduce((acc, player) => {
    const group = player.group_name || "Ohne Gruppe";
    if (!acc[group]) acc[group] = [];
    acc[group].push(player);
    return acc;
  }, {} as Record<string, PlayerStat[]>);

  const groupKeys = Object.keys(groupedStats).sort();
  const sortedKeys = groupKeys.filter(g => g !== "Ohne Gruppe");
  if (groupKeys.includes("Ohne Gruppe")) {
    sortedKeys.push("Ohne Gruppe");
  }

  return (
    <div className="space-y-10 w-full">
      {sortedKeys.map((group) => (
        <div key={group} className="space-y-4">
          <h3 className="text-xl font-bold text-stone-800 px-2 flex items-center gap-2">
            {group !== "Ohne Gruppe" ? (
              <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-xl border border-orange-200 shadow-sm inline-flex items-center gap-2">
                🏆 Gruppe {group}
              </span>
            ) : (
              <span className="text-stone-500">Ohne Gruppe</span>
            )}
          </h3>
          
          <div className="w-full overflow-x-auto rounded-3xl border border-stone-200 bg-white/50 backdrop-blur-xl shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              {tableHeader}
              <tbody className="divide-y divide-stone-100">
                {renderTableRows(groupedStats[group])}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
