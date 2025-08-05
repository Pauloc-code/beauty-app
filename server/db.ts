// No seu projeto, encontre e abra o ficheiro localizado em: server/db.ts
// Apague todo o conteúdo dele e substitua por este código.

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;

import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Esta configuração garante que a ligação com a base de dados no Render
// seja segura e aceite o certificado SSL necessário.
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

const pool = new Pool(poolConfig);

export const db = drizzle(pool, { schema });
