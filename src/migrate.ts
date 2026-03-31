import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  try {
    console.log("Adding phase and bracket_position to matches...");
    await sql`ALTER TABLE matches ADD COLUMN IF NOT EXISTS phase VARCHAR(50);`;
    await sql`ALTER TABLE matches ADD COLUMN IF NOT EXISTS bracket_position INT;`;
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

main();
