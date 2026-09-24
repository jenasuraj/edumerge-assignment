import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;
const [, , nameArg, emailArg, passwordArg, phoneArg] = process.argv;

if (!nameArg || !emailArg || !passwordArg) {
  console.error(
    "Usage: npm run create-admin -- \"Admin\" admin@example.com password [phone]",
  );
  process.exit(1);
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL or POSTGRES_URL.");
  process.exit(1);
}

const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const passwordHash = await bcrypt.hash(passwordArg, 12);
const result = await pool.query(
  `INSERT INTO users (name, email, phone, password, role, is_active)
   VALUES ($1, LOWER($2), $3, $4, 'ADMIN', true)
   ON CONFLICT (email)
   DO UPDATE SET
     name = EXCLUDED.name,
     phone = EXCLUDED.phone,
     password = EXCLUDED.password,
     role = 'ADMIN',
     is_active = true
   RETURNING id, name, email`,
  [nameArg, emailArg, phoneArg || null, passwordHash],
);

console.log("Admin ready:", result.rows[0]);
await pool.end();
