import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startScheduler } from "../scheduler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Allow /embed and /notion-template to be embedded in Notion iframes
  app.use("/embed", (_req, res, next) => {
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    next();
  });
  app.use("/notion-template", (_req, res, next) => {
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    next();
  });

  // ── Public JSON API (no auth required) ──
  // GET /api/public/sessions?school=MIT&upcoming=true&limit=10
  app.get("/api/public/sessions", async (req, res) => {
    try {
      // Dynamic import to avoid bundling client-side data at startup
      const { allSessions, schoolsMap } = await import("../../client/src/data/schools.js").catch(() =>
        import("../../client/src/data/schools")
      );
      let sessions = [...allSessions] as unknown as Array<Record<string, unknown>>;

      // Filter by school name or abbreviation
      const schoolParam = req.query.school as string | undefined;
      if (schoolParam) {
        const q = schoolParam.toLowerCase();
        sessions = sessions.filter((s) => {
          const school = schoolsMap[s.schoolId as string];
          return (
            (school?.name || "").toLowerCase().includes(q) ||
            (school?.shortName || "").toLowerCase().includes(q) ||
            (s.schoolId as string).toLowerCase().includes(q)
          );
        });
      }

      // Filter upcoming only
      const upcomingParam = req.query.upcoming as string | undefined;
      if (upcomingParam === "true" || upcomingParam === "1") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        sessions = sessions.filter((s) => {
          if (s.isRolling) return true;
          const dates = s.dates as string[] | undefined;
          if (!dates || dates.length === 0) return false;
          return dates.some((d) => new Date(d + "T00:00:00") >= today);
        });
      }

      // Limit
      const limitParam = parseInt((req.query.limit as string) || "50", 10);
      const limit = Math.min(Math.max(1, isNaN(limitParam) ? 50 : limitParam), 200);
      sessions = sessions.slice(0, limit);

      // Enrich with school info
      const enriched = sessions.map((s) => {
        const school = schoolsMap[s.schoolId as string];
        return {
          ...s,
          school: school
            ? { id: s.schoolId, name: school.name, shortName: school.shortName, registrationPage: school.registrationPage }
            : null,
        };
      });

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.json({
        source: "AdmitLens (admissionhub-f6apvxhh.manus.space)",
        description: "Official university admissions Info Session data. Updated daily from school portals.",
        total: enriched.length,
        sessions: enriched,
      });
    } catch (err) {
      console.error("[Public API] Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start the daily crawler scheduler after server is ready
    startScheduler().catch((err) =>
      console.error("[Scheduler] Failed to start:", err)
    );
  });
}

startServer().catch(console.error);
