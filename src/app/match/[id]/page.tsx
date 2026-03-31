"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Match = {
  id: string;
  player1_name: string;
  player1_username: string;
  player2_name: string;
  player2_username: string;
  status: string;
};

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  // Live State
  const [p1Points, setP1Points] = useState(0);
  const [p2Points, setP2Points] = useState(0);
  const [p1Sets, setP1Sets] = useState(0);
  const [p2Sets, setP2Sets] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [initialServerForSet, setInitialServerForSet] = useState<1 | 2>(1);

  useEffect(() => {
    // Define random initial server on mount only
    setInitialServerForSet(Math.random() > 0.5 ? 1 : 2);
  }, []);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function fetchMatch() {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (res.ok) {
          const data = await res.json();
          setMatch(data.match);
        } else {
          router.push("/uebersicht");
        }
      } catch (error) {
        console.error("Failed to load match", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (matchId && sessionStatus === "authenticated") {
      fetchMatch();
    }
  }, [matchId, sessionStatus, router]);

  const totalPoints = p1Points + p2Points;
  let currentServer: 1 | 2;
  if (p1Points >= 10 && p2Points >= 10) {
    currentServer = totalPoints % 2 === 0 ? initialServerForSet : (initialServerForSet === 1 ? 2 : 1);
  } else {
    const serveTurn = Math.floor(totalPoints / 2);
    currentServer = serveTurn % 2 === 0 ? initialServerForSet : (initialServerForSet === 1 ? 2 : 1);
  }

  let setWinner: 1 | 2 | null = null;
  if (p1Points >= 11 && p1Points - p2Points >= 2) {
    setWinner = 1;
  } else if (p2Points >= 11 && p2Points - p1Points >= 2) {
    setWinner = 2;
  }

  const handleNextSet = () => {
    if (setWinner === 1) setP1Sets(p1Sets + 1);
    else if (setWinner === 2) setP2Sets(p2Sets + 1);
    
    setP1Points(0);
    setP2Points(0);
    setCurrentSet(currentSet + 1);
    setInitialServerForSet(prev => prev === 1 ? 2 : 1);
  };

  const handleFinishMatch = async (overrideP1Sets?: number, overrideP2Sets?: number, skipConfirm = false) => {
    if (!skipConfirm) {
      const isConfirmed = window.confirm(
        "Bist du sicher, dass das Match beendet ist? Die Daten werden gespeichert und fließen in die Statistik ein."
      );
      if (!isConfirmed) return;
    }

    const finalP1Sets = overrideP1Sets !== undefined ? overrideP1Sets : p1Sets;
    const finalP2Sets = overrideP2Sets !== undefined ? overrideP2Sets : p2Sets;

    setIsFinishing(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p1Sets: finalP1Sets, p2Sets: finalP2Sets }),
      });
      if (res.ok) {
        router.push("/uebersicht");
      } else {
        alert("Fehler beim Beenden des Matches.");
      }
    } catch (error) {
      console.error(error);
      alert("Fehler beim Speichern.");
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCancel = () => {
    router.push("/uebersicht");
  };

  if (isLoading || !match) {
    return (
      <main className="flex justify-center items-center h-screen px-4">
        <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center px-4 pb-20 pt-12 min-h-screen">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-4xl mb-4 block">🏓</span>
          <h1 className="text-3xl font-black text-stone-800">Aktuelles Spiel</h1>
          <p className="text-stone-500 mt-2 font-medium">
            Satz {currentSet} läuft...
          </p>
        </div>

        {/* Score Board */}
        <div className="glass-card rounded-3xl p-6 md:p-12">
          
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 text-center">
            
            {/* Player 1 */}
            <div className={`flex-1 flex flex-col items-center bg-white/50 rounded-2xl p-6 border ${currentServer === 1 ? 'border-orange-500 shadow-orange-500/20 shadow-lg ring-2 ring-orange-500' : 'border-stone-100 shadow-sm'} relative overflow-hidden transition-all duration-300`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              
              <div className="h-8 flex items-center justify-center w-full mt-2 mb-1">
                {currentServer === 1 && (
                  <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse shadow-sm">
                    🏓 Aufschlag
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-stone-800">{match.player1_name}</h2>
              <span className="text-sm text-stone-400 mb-4">@{match.player1_username}</span>
              
              <div className="text-7xl font-black text-blue-600 mb-6 tracking-tighter">
                {p1Points}
              </div>
              
              <div className="flex justify-center gap-4 mb-6">
                <button 
                  onClick={() => setP1Points(Math.max(0, p1Points - 1))}
                  disabled={setWinner !== null}
                  className="w-14 h-14 rounded-full bg-stone-100 text-stone-600 text-3xl font-bold flex items-center justify-center hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <button 
                  onClick={() => setP1Points(p1Points + 1)}
                  disabled={setWinner !== null}
                  className="w-14 h-14 rounded-full bg-blue-500 text-white text-3xl font-bold flex items-center justify-center hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              
              <div className="mt-auto px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg text-lg">
                Sätze: {p1Sets}
              </div>
            </div>

            {/* VS Badge */}
            <div className="flex items-center justify-center hidden md:flex">
              <div className="w-16 h-16 rounded-full bg-stone-800 text-white font-black italic text-xl flex items-center justify-center shadow-xl">
                VS
              </div>
            </div>

            {/* Player 2 */}
            <div className={`flex-1 flex flex-col items-center bg-white/50 rounded-2xl p-6 border ${currentServer === 2 ? 'border-orange-500 shadow-orange-500/20 shadow-lg ring-2 ring-orange-500' : 'border-stone-100 shadow-sm'} relative overflow-hidden transition-all duration-300`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              
              <div className="h-8 flex items-center justify-center w-full mt-2 mb-1">
                {currentServer === 2 && (
                  <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse shadow-sm">
                    🏓 Aufschlag
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-stone-800">{match.player2_name}</h2>
              <span className="text-sm text-stone-400 mb-4">@{match.player2_username}</span>
              
              <div className="text-7xl font-black text-red-600 mb-6 tracking-tighter">
                {p2Points}
              </div>
              
              <div className="flex justify-center gap-4 mb-6">
                <button 
                  onClick={() => setP2Points(Math.max(0, p2Points - 1))}
                  disabled={setWinner !== null}
                  className="w-14 h-14 rounded-full bg-stone-100 text-stone-600 text-3xl font-bold flex items-center justify-center hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <button 
                  onClick={() => setP2Points(p2Points + 1)}
                  disabled={setWinner !== null}
                  className="w-14 h-14 rounded-full bg-red-500 text-white text-3xl font-bold flex items-center justify-center hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <div className="mt-auto px-4 py-2 bg-red-50 text-red-700 font-bold rounded-lg text-lg">
                Sätze: {p2Sets}
              </div>
            </div>

          </div>

          <div className="mt-12 text-center min-h-[5rem] flex items-center justify-center">
            {setWinner !== null ? (() => {
               const nextP1Sets = p1Sets + (setWinner === 1 ? 1 : 0);
               const nextP2Sets = p2Sets + (setWinner === 2 ? 1 : 0);
               const isMatchFinished = nextP1Sets >= 3 || nextP2Sets >= 3 || (nextP1Sets + nextP2Sets >= 5 && nextP1Sets !== nextP2Sets);
               
               return (
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                   <p className="text-xl font-black text-green-600 mb-4">
                     Satz {currentSet} geht an {setWinner === 1 ? match.player1_name : match.player2_name}! 🎉
                   </p>
                   {isMatchFinished ? (
                     <button 
                       onClick={() => handleFinishMatch(nextP1Sets, nextP2Sets, true)}
                       disabled={isFinishing}
                       className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                     >
                       {isFinishing ? "Match wird gespeichert..." : "Match automatisch beenden & Speichern"}
                     </button>
                   ) : (
                     <button 
                       onClick={handleNextSet}
                       className="px-8 py-4 bg-stone-800 text-white font-bold rounded-xl shadow-lg hover:shadow-stone-800/25 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-800"
                     >
                       Nächsten Satz starten
                     </button>
                   )}
                 </div>
               );
            })() : (
               <p className="text-stone-400 font-medium tracking-wide">
                 Spiel läuft: Bis 11 Punkte (2 Punkte Vorsprung nötig). <br/>
                 Bei 10:10 wechselt der Aufschlag nach jedem Punkt.
               </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
          <button 
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-3 bg-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-300 transition-colors"
          >
            Zurück / Abbrechen
          </button>
          <button 
            onClick={() => handleFinishMatch()}
            disabled={isFinishing}
            className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-colors disabled:opacity-50"
          >
            {isFinishing ? "Wird gespeichert..." : "Spiel beenden & Speichern"}
          </button>
        </div>

      </div>
    </main>
  );
}
