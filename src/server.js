import "dotenv/config";
import express from "express";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const pool = new Pool();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// enable layouts
app.use(expressLayouts);
app.set("layout", "layout");
/* HOME PAGE */
app.get("/", async (req, res) => {
  const { rows: threads } = await pool.query(`
    SELECT 
      t.id,
      t.title,
      t.author,
      t.created_at,
      COUNT(r.id) AS reply_count
    FROM threads t
    LEFT JOIN replies r ON r.thread_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);

  res.render("home", { threads, title: "Mini Forum" });
});

/* CREATE THREAD */
app.post("/threads", async (req, res) => {
  const { title, author, content } = req.body;

  const result = await pool.query(
    `
      INSERT INTO threads (title, author, content)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
    [title, author || null, content]
  );

  res.redirect(`/thread/${result.rows[0].id}`);
});

/* VIEW THREAD PAGE */
app.get("/thread/:id", async (req, res) => {
  const id = Number(req.params.id);

  const { rows: threadRows } = await pool.query(
    `SELECT * FROM threads WHERE id = $1`,
    [id]
  );

  if (threadRows.length === 0) return res.status(404).send("Not found");

  const thread = threadRows[0];

  const { rows: replies } = await pool.query(
    `
      SELECT * FROM replies
      WHERE thread_id = $1
      ORDER BY created_at ASC
    `,
    [id]
  );

  res.render("thread", { thread, replies });
});

/* POST A REPLY */
app.post("/thread/:id/replies", async (req, res) => {
  const { author, content } = req.body;
  const id = Number(req.params.id);

  await pool.query(
    `
      INSERT INTO replies (thread_id, author, content)
      VALUES ($1, $2, $3)
    `,
    [id, author || null, content]
  );

  res.redirect(`/thread/${id}`);
});

app.listen(process.env.PORT, () =>
  console.log(`Forum running on http://localhost:${process.env.PORT}`)
);
