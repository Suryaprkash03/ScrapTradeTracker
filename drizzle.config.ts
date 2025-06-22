import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables BEFORE accessing them
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts", // make sure this path is correct
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL, // ✅ correct key
  },
});
