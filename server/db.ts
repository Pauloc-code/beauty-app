// Este é o código correto para o seu ficheiro server/db.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;

import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Garante que a string de conexão exige SSL, como necessário pelo Render.
let connectionString = process.env.DATABASE_URL;
if (!connectionString.includes("sslmode=require")) {
  connectionString += "?sslmode=require";
}

// A configuração do pool agora usa a string de conexão ajustada.
const pool = new Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });
