// No seu projeto, encontre e abra o ficheiro localizado em: drizzle.config.ts
// Apague todo o conteúdo dele e substitua por este código.

import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Esta secção "driverConfig" é a forma correta de passar a
  // configuração SSL para a ferramenta Drizzle Kit.
  driverConfig: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

