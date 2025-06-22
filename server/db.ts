// server/db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

dotenv.config();

// 👇 Required for Neon websocket support
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Re-export schema tables for direct access
export * from '@shared/schema';
