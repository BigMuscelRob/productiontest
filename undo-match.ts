import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function undoMatch() {
  if (!process.env.DATABASE_URL) throw new Error("No DB URL");
  const sql = neon(process.env.DATABASE_URL);
  
  // Find the last completed match based on creation order or just the only completed one
  const matches = await sql`SELECT id FROM matches WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1`;
  
  if (matches.length === 0) {
    console.log("No completed matches found.");
    return;
  }
  
  const id = matches[0].id;
  await sql`UPDATE matches SET status = 'in_progress', player1_score = 0, player2_score = 0 WHERE id = ${id}`;
  
  console.log(`Match ${id} has been reset to in_progress.`);
}

undoMatch().catch(console.error);
