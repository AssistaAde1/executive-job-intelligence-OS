import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase if keys exist
let supabase: ReturnType<typeof createClient> | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// In-memory fallback dataset for when Supabase is not connected yet
let inMemoryJobs: any[] = [];
let nextId = 1;

// API Routes
app.get("/api/jobs", async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json({ connected: true, jobs: data });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Fallback
  return res.json({ connected: false, jobs: inMemoryJobs });
});

app.post("/api/jobs", async (req, res) => {
  const { title, description, company_name, geography, job_source, role_category } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert([{ title, description, company_name, geography, job_source, role_category }] as any)
        .select();

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json({ connected: true, job: data[0] });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Fallback
  const newJob = {
    id: nextId++,
    title,
    company_name,
    geography,
    job_source,
    role_category,
    description,
    created_at: new Date().toISOString(),
  };
  inMemoryJobs.unshift(newJob);

  return res.json({ connected: false, job: newJob });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use((req, res, next) => {
      vite.middlewares.handle(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
