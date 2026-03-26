export default function SpielerPage() {
  return (
    <main className="flex flex-col items-center px-4 pb-20 pt-12">
      <div className="w-full max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center gap-4">
          <span className="text-5xl">👥</span>
          <h1 className="text-3xl font-black text-stone-800">Spieler</h1>
          <p className="text-stone-500 max-w-md">
            Hier findest du bald alle angemeldeten Spieler und deren Statistiken.
          </p>
        </div>
      </div>
    </main>
  );
}
