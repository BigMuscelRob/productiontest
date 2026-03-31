import PlayerStandingsTable from "@/components/PlayerStandingsTable";

export default function SpielerPage() {
  return (
    <main className="flex flex-col items-center px-4 pb-20 pt-12">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <span className="text-5xl mb-4 block">👥</span>
          <h1 className="text-3xl font-black text-stone-800">Spieler</h1>
          <p className="text-stone-500 mt-2">
            Alle angemeldeten Spieler und deren komplette Statistiken im Überblick.
          </p>
        </div>

        <section>
          <PlayerStandingsTable grouped={false} />
        </section>
      </div>
    </main>
  );
}
