import "dotenv/config";
import express from "express";
import path from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// If you want explicit config, you can pass options here.
// For now this will read from env: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
const pool = new Pool();

/* Create forum router */
const forum = express.Router();

// Parse form bodies
app.use(express.urlencoded({ extended: true }));

// Static files (CSS, JS, images) under /forum
app.use("/forum", express.static(path.join(__dirname, "public")));

// Setup EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout");

app.use(
  "/forum",
  express.static(path.join(__dirname, "public"), {
    maxAge: 0,
    etag: false,
    lastModified: false,
  })
);
/* ================================
   ROUTES
   ================================ */

/* HOME PAGE – list forums */
forum.get("/", async (req, res) => {
  try {
    const { rows: forums } = await pool.query(
      `
      SELECT id, name, slug, description
      FROM forums
      ORDER BY id ASC
      `
    );

    // home.ejs should loop over "forums" (not threads anymore)
    res.render("home", {
      title: "Mini Forum",
      forums,
    });
  } catch (err) {
    console.error("Error loading forums:", err);
    res.status(500).send("Server error");
  }
});

/* FORUM PAGE – list threads in a forum */
forum.get("/f/:id", async (req, res) => {
  const forumId = Number(req.params.id);

  try {
    // forum info
    const { rows: forumRows } = await pool.query(
      `SELECT * FROM forums WHERE id = $1`,
      [forumId]
    );

    if (forumRows.length === 0) {
      return res.status(404).send("Forum not found");
    }

    const forumData = forumRows[0];

    // threads in this forum
    const { rows: threads } = await pool.query(
      `
      SELECT 
        t.id,
        t.title,
        t.author,
        t.created_at,
        COUNT(r.id) AS reply_count
      FROM threads t
      LEFT JOIN replies r ON r.thread_id = t.id
      WHERE t.forum_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC
      `,
      [forumId]
    );

    res.render("forum", {
      title: forumData.name,
      forum: forumData,
      threads,
    });
  } catch (err) {
    console.error("Error loading forum:", err);
    res.status(500).send("Server error");
  }
});

forum.post("/f/:forumId/threads", async (req, res) => {
  const forumId = Number(req.params.forumId);
  const { title, author, content } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO threads (title, author, content, forum_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [title, author || null, content, forumId] // 👈 add forumId here
    );

    res.redirect(`/forum/thread/${result.rows[0].id}`);
  } catch (err) {
    console.error("Error creating thread:", err);
    res.status(500).send("Server error");
  }
});

/* VIEW THREAD PAGE */
forum.get("/thread/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const { rows: threadRows } = await pool.query(
      `SELECT * FROM threads WHERE id = $1`,
      [id]
    );

    if (threadRows.length === 0) {
      return res.status(404).send("Not found");
    }

    const thread = threadRows[0];

    const { rows: replies } = await pool.query(
      `
      SELECT *
      FROM replies
      WHERE thread_id = $1
      ORDER BY created_at ASC
      `,
      [id]
    );

    res.render("thread", {
      title: thread.title,
      thread,
      replies,
    });
  } catch (err) {
    console.error("Error loading thread:", err);
    res.status(500).send("Server error");
  }
});

/* POST A REPLY */
forum.post("/thread/:id/replies", async (req, res) => {
  const { author, content } = req.body;
  const id = Number(req.params.id);

  try {
    await pool.query(
      `
      INSERT INTO replies (thread_id, author, content)
      VALUES ($1, $2, $3)
      `,
      [id, author || null, content]
    );

    res.redirect(`/forum/thread/${id}`);
  } catch (err) {
    console.error("Error creating reply:", err);
    res.status(500).send("Server error");
  }
});

/* DELETE THREAD */
forum.post("/thread/:id/delete", async (req, res) => {
  const id = Number(req.params.id);

  try {
    // First get forum_id so we can redirect back to the forum page
    const { rows } = await pool.query(
      `SELECT forum_id FROM threads WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).send("Thread not found");
    }

    const forumId = rows[0].forum_id;

    // Delete replies
    await pool.query(`DELETE FROM replies WHERE thread_id = $1`, [id]);

    // Delete thread
    await pool.query(`DELETE FROM threads WHERE id = $1`, [id]);

    res.redirect(`/forum/f/${forumId}`);
  } catch (err) {
    console.error("Error deleting thread:", err);
    res.status(500).send("Server error");
  }
});

/* DELETE REPLY */
forum.post("/thread/:threadId/replies/:replyId/delete", async (req, res) => {
  const threadId = Number(req.params.threadId);
  const replyId = Number(req.params.replyId);

  try {
    await pool.query(
      `
      DELETE FROM replies
      WHERE id = $1 AND thread_id = $2
      `,
      [replyId, threadId]
    );

    res.redirect(`/forum/thread/${threadId}`);
  } catch (err) {
    console.error("Error deleting reply:", err);
    res.status(500).send("Server error");
  }
});

/* MOUNT ROUTER */
app.use("/forum", forum);

/* START SERVER */
const PORT = process.env.PORT || 3333;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Forum running on http://localhost:${PORT}`);
});
