import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}
const sql = neon(dbUrl);

async function main() {
  console.log("Canceling current tournament and creating mock data...");

  // 1. Delete all matches and players (except admins)
  await sql`DELETE FROM matches`;
  await sql`DELETE FROM users WHERE role != 'admin'`;

  // 2. Insert 32 players into 16 groups (Group A to P)
  const groupNames = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i)); // A to P
  const players = [];

  console.log("Inserting 32 mock players...");
  for (let i = 0; i < 32; i++) {
    const groupId = Math.floor(i / 2);
    const groupName = groupNames[groupId];
    const name = `Test Spieler ${i + 1}`;
    const username = `test_player_${i + 1}`;
    const passwordHash = ""; // dummy
    
    const [user] = await sql`
      INSERT INTO users (name, username, password_hash, role, group_name)
      VALUES (${name}, ${username}, ${passwordHash}, 'player', ${groupName})
      RETURNING id, name
    `;
    players.push(user);
  }

  // 3. Define Bracket Structure
  const phases = [
    { name: "sechzehntelfinale", matchCount: 16 },
    { name: "achtelfinale", matchCount: 8 },
    { name: "viertelfinale", matchCount: 4 },
    { name: "halbfinale", matchCount: 2 },
    { name: "finale", matchCount: 1 }
  ];

  // We will run through the bracket phase by phase and simulate it entirely.
  let currentPhasePlayers = [...players]; // 32 players
  let nextPhasePlayers: typeof players = [];

  for (let pIdx = 0; pIdx < phases.length; pIdx++) {
    const phase = phases[pIdx];
    console.log(`Simulating ${phase.name}...`);
    
    for (let m = 0; m < phase.matchCount; m++) {
      // Pick two players
      const p1 = currentPhasePlayers[m * 2];
      const p2 = currentPhasePlayers[m * 2 + 1];

      // Randomize score (best of 3 means one gets 2, the other 0 or 1)
      const p1Wins = Math.random() > 0.5;
      const score1 = p1Wins ? 2 : Math.floor(Math.random() * 2);
      const score2 = !p1Wins ? 2 : Math.floor(Math.random() * 2);
      
      const winner = p1Wins ? p1 : p2;

      const isFinale = phase.name === "finale";
      const status = isFinale ? 'pending' : 'completed';

      // Insert match
      await sql`
        INSERT INTO matches (player1_id, player2_id, player1_score, player2_score, status, phase, bracket_position)
        VALUES (
          ${p1?.id || null}, 
          ${p2?.id || null}, 
          ${isFinale ? 0 : score1}, 
          ${isFinale ? 0 : score2}, 
          ${status}, 
          ${phase.name}, 
          ${m + 1}
        )
      `;

      if (winner && !isFinale) {
        nextPhasePlayers.push(winner);
      }
    }

    // Move to next phase
    currentPhasePlayers = nextPhasePlayers;
    nextPhasePlayers = [];
  }

  console.log("Tournament mocked successfully!");
}

main().catch(console.error);
