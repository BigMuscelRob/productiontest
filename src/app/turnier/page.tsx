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

export default function BracketPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/turnier/bracket")
      .then(res => res.json())
      .then(data => {
        if (data.matches) setMatches(data.matches);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen px-4">
        <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </main>
    );
  }

  if (matches.length === 0) {
    return (
      <main className="flex flex-col items-center px-4 pb-20 pt-12">
        <div className="text-center p-12 glass-card rounded-3xl max-w-2xl">
          <h1 className="text-3xl font-black text-stone-800 mb-4">🏆 Turnierbaum</h1>
          <p className="text-stone-500">Das Turnier hat noch nicht begonnen oder der Bracket wurde noch nicht erstellt.</p>
        </div>
      </main>
    );
  }

  // Find finale
  const finaleMatch = matches.find(m => m.phase === 'finale');

  // Determine active phases
  const activePhases = PHASES_ORDER.filter(phase => 
    matches.some(m => m.phase === phase)
  );

  const getChildren = (match: Match): [Match | undefined, Match | undefined] => {
    const phaseIdx = PHASES_ORDER.indexOf(match.phase);
    if (phaseIdx <= 0) return [undefined, undefined]; // No children
    
    const childPhase = PHASES_ORDER[phaseIdx - 1];
    const topChildPos = match.bracket_position * 2 - 1;
    const botChildPos = match.bracket_position * 2;

    const topChild = matches.find(m => m.phase === childPhase && m.bracket_position === topChildPos);
    const botChild = matches.find(m => m.phase === childPhase && m.bracket_position === botChildPos);

    return [topChild, botChild];
  };

  const MatchCard = ({ match }: { match: Match }) => {
    const isCompleted = match.status === 'completed';
    // Winner logic (if tied, no winner strictly highlighted, but assuming best-of-3 it shouldn't tie)
    const p1Wins = isCompleted && match.player1_score > match.player2_score;
    const p2Wins = isCompleted && match.player2_score > match.player1_score;

    return (
        <div className={`relative rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border ${isCompleted ? 'border-orange-300 ring-2 ring-orange-100' : 'border-stone-200'} w-[130px] md:w-36 lg:w-44 xl:w-52 hover:shadow-lg transition-all overflow-hidden bg-white/90 backdrop-blur-md`}>
          <div className="flex flex-col w-full relative z-10">
            {/* Player 1 */}
            <div className={`flex justify-between items-center px-2 py-2 text-xs md:text-sm border-b transition-colors ${
                p1Wins ? 'bg-orange-100 font-bold text-orange-800 border-orange-200 shadow-inner' : 
                p2Wins ? 'text-stone-400 bg-stone-50/50' : 
                match.player1_id ? 'text-stone-700 bg-white font-medium' : 'text-stone-400 bg-stone-50 border-dashed'
            }`}>
              <span className="truncate pr-2">{match.player1_name || 'TBD'}</span>
              <span className="font-mono">{isCompleted ? match.player1_score : '-'}</span>
              {/* Winner badge indicator */}
              {p1Wins && <div className="absolute left-0 top-0 bottom-1/2 w-1 bg-orange-500"></div>}
            </div>
            {/* Player 2 */}
            <div className={`flex justify-between items-center px-2 py-2 text-xs md:text-sm transition-colors ${
                p2Wins ? 'bg-orange-100 font-bold text-orange-800 border-orange-200 shadow-inner' : 
                p1Wins ? 'text-stone-400 bg-stone-50/50' : 
                match.player2_id ? 'text-stone-700 bg-white font-medium' : 'text-stone-400 bg-stone-50 border-dashed'
            }`}>
              <span className="truncate pr-2">{match.player2_name || 'TBD'}</span>
              <span className="font-mono">{isCompleted ? match.player2_score : '-'}</span>
              {/* Winner badge indicator */}
              {p2Wins && <div className="absolute left-0 bottom-0 top-1/2 w-1 bg-orange-500"></div>}
            </div>
          </div>
        </div>
    );
  };

  // Left Bracket Tree (Root is on the right, leaves are on the left)
  const LeftTree = ({ match, isFinaleChild = false }: { match: Match, isFinaleChild?: boolean }) => {
    const [topChild, botChild] = getChildren(match);

    if (!topChild && !botChild) {
      return (
        <div className="flex items-center py-2 h-full">
          <MatchCard match={match} />
        </div>
      );
    }

    return (
      <div className="flex flex-row items-stretch">
        <div className="flex flex-col justify-around relative py-2">
          {/* Vertical line connecting top and bot children */}
          {(topChild && botChild) && (
            <div className="absolute right-0 top-[25%] bottom-[25%] w-[2px] bg-orange-400 opacity-70 border-r-2 border-orange-500 rounded-r-sm"></div>
          )}

          {topChild && (
             <div className="flex flex-row items-center justify-end relative my-1">
                <LeftTree match={topChild} />
                <div className="h-[2px] bg-orange-500 opacity-70 w-3 md:w-6 lg:w-8 shrink-0"></div>
             </div>
          )}
          {botChild && (
             <div className="flex flex-row items-center justify-end relative my-1">
                <LeftTree match={botChild} />
                <div className="h-[2px] bg-orange-500 opacity-70 w-3 md:w-6 lg:w-8 shrink-0"></div>
             </div>
          )}
        </div>
        <div className="flex items-center group">
            <div className={`h-[2px] bg-orange-500 opacity-70 w-3 md:w-6 lg:w-8 shrink-0 transition-all ${(match.status === 'completed') ? 'bg-orange-600 opacity-100 shadow-[0_0_8px_rgba(234,88,12,0.6)] h-[2.5px]' : ''}`}></div>
            <MatchCard match={match} />
            {isFinaleChild && <div className="h-[2px] bg-orange-500 opacity-70 w-3 md:w-6 shrink-0"></div>}
        </div>
      </div>
    );
  };

  // Right Bracket Tree (Root is on the left, leaves are on the right)
  const RightTree = ({ match, isFinaleChild = false }: { match: Match, isFinaleChild?: boolean }) => {
    const [topChild, botChild] = getChildren(match);

    if (!topChild && !botChild) {
      return (
        <div className="flex items-center py-2 h-full">
          <MatchCard match={match} />
        </div>
      );
    }

    return (
      <div className="flex flex-row-reverse items-stretch">
        <div className="flex flex-col justify-around relative py-2">
          {/* Vertical line connecting top and bot children */}
          {(topChild && botChild) && (
            <div className="absolute left-0 top-[25%] bottom-[25%] w-[2px] bg-orange-400 opacity-70 border-l-2 border-orange-500 rounded-l-sm"></div>
          )}

          {topChild && (
             <div className="flex flex-row-reverse items-center justify-end relative my-1">
                <RightTree match={topChild} />
                <div className="h-[2px] bg-orange-500 opacity-70 w-3 md:w-6 lg:w-8 shrink-0"></div>
             </div>
          )}
          {botChild && (
             <div className="flex flex-row-reverse items-center justify-end relative my-1">
                <RightTree match={botChild} />
                <div className="h-[2px] bg-orange-500 opacity-70 w-3 md:w-6 lg:w-8 shrink-0"></div>
             </div>
          )}
        </div>
        <div className="flex items-center flex-row-reverse">
            <div className={`h-[2px] bg-orange-500 opacity-70 w-3 md:w-6 lg:w-8 shrink-0 transition-all ${(match.status === 'completed') ? 'bg-orange-600 opacity-100 shadow-[0_0_8px_rgba(234,88,12,0.6)] h-[2.5px]' : ''}`}></div>
            <MatchCard match={match} />
            {isFinaleChild && <div className="h-[2px] bg-orange-500 opacity-70 w-3 md:w-6 shrink-0"></div>}
        </div>
      </div>
    );
  };

  const highestPreFinalPhase = activePhases.filter(p => p !== 'finale').pop();
  let leftRootMatch: Match | undefined;
  let rightRootMatch: Match | undefined;

  if (highestPreFinalPhase) {
    const highestMatches = matches.filter(m => m.phase === highestPreFinalPhase).sort((a,b) => a.bracket_position - b.bracket_position);
    leftRootMatch = highestMatches[0];
    rightRootMatch = highestMatches[1];
  }

  // Determine scaling classes based on how many phases we have active
  // If we have 5 phases (incl finale), it's 16tel finale start. We need more shrinking on Desktop.
  const phaseCount = activePhases.length;
  // Dynamic font sizing for smaller viewports when phaseCount is high
  const getScaleClass = () => {
     if (phaseCount >= 5) return 'lg:scale-[0.80] xl:scale-[0.90] 2xl:scale-100';
     if (phaseCount === 4) return 'lg:scale-95 xl:scale-100';
     return 'scale-100';
  }

  return (
    <main className="flex flex-col items-center px-0 md:px-4 pb-32 pt-12 min-h-screen w-full bg-[#fcfcfc] overflow-hidden">
      <div className="w-full flex flex-col items-center space-y-10">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl font-black text-stone-800 mb-2">
            Turnier<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">baum</span>
          </h1>
          <p className="text-stone-500 font-medium tracking-wide text-sm bg-orange-50 py-1 px-4 rounded-full inline-block mt-2 border border-orange-200 uppercase">
             Live Bracket
          </p>
        </div>

        {/* 
          Container behavior:
          - Safe scrolling layout: ensures it doesn't clip on the left/right and maintains generous padding.
        */}
        <div className={`w-full overflow-x-auto px-4 md:px-12 xl:px-24 py-8`}>
           <div className={`flex flex-row items-center gap-1 md:gap-2 shrink-0 min-w-max mx-auto w-max transition-transform ${getScaleClass()}`}>
              
              {/* Left Wing */}
              {leftRootMatch && (
                 <div className="flex items-center relative">
                    <LeftTree match={leftRootMatch} isFinaleChild={!!finaleMatch} />
                 </div>
              )}

              {/* Center Finale */}
              {finaleMatch && (
                  <div className="flex flex-col items-center justify-center relative shrink-0 z-10 px-0 md:px-4 lg:px-6">
                      <div className="flex items-center gap-2 mb-4 absolute -top-16">
                        <span className="text-2xl drop-shadow-md">🏆</span>
                        <h3 className="text-xl md:text-2xl font-black text-stone-800 tracking-wider uppercase text-shadow-sm">Finale</h3>
                        <span className="text-2xl drop-shadow-md">🏆</span>
                      </div>
                      
                      <div className="transform scale-110 lg:scale-125 transition-transform z-20 shadow-[0_0_40px_rgba(249,115,22,0.15)] rounded-xl">
                        <MatchCard match={finaleMatch} />
                      </div>
                  </div>
              )}

              {/* Right Wing */}
              {rightRootMatch && (
                 <div className="flex items-center relative">
                    <RightTree match={rightRootMatch} isFinaleChild={!!finaleMatch} />
                 </div>
              )}

           </div>
        </div>

      </div>
    </main>
  );
}
