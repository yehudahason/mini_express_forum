import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import cors from "cors";
import { sequelize } from "./models/index.js";
import { globalLimiter } from "./utils/ratelimit.js";
import { logRequests } from "./utils/logMiddleware.js";
import forum from "./routes/forumroutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3333",
  "https://pitron-halomot.org",
  "https://www.pitron-halomot.org",
];

app.use(logRequests);
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, internal)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked: " + origin));
      }
    },
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.locals.formatDate = function (date) {
  return new Date(date).toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem",
    hour12: false,
    dateStyle: "short",
    timeStyle: "short",
  });
};

app.use((req, res, next) => {
  res.locals.formatDate = app.locals.formatDate;
  next();
});
/* ==== EXPRESS SETUP ==== */
app.use(express.urlencoded({ extended: true }));

app.use(
  "/forum",
  express.static(path.join(__dirname, "public"), {
    maxAge: 0,
    etag: false,
    lastModified: false,
  })
);

app.use(globalLimiter);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

/* ======================================================
   MOUNT ROUTER
====================================================== */
app.use("/forum", forum);

/* ======================================================
   START SERVER
====================================================== */
const PORT = process.env.PORT || 3333;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL via Sequelize!");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Forum running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("DB connection error:", err);
  }
})();
