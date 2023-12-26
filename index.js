import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import pg from "pg";
import cors from "cors";

const app = express();
const port = 4000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "blogdb",
  password: "2627897pppp",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "userimg/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const options = { day: "2-digit", month: "short", year: "numeric" };

app.use(express.static("public"));
app.use("/userimg", express.static("userimg"));

// const formattedDate = (date) => {
//   const d = new Date(date);
//   const pad = (n) => (n < 10 ? "0" + n : n);
//   return (
//     pad(d.getMonth() + 1) +
//     "/" +
//     pad(
//       d.getDate() +
//         "/" +
//         d.getFullYear() +
//         " " +
//         pad(d.getHours()) +
//         ":" +
//         pad(d.getMinutes()) +
//         ":" +
//         pad(d.getSeconds())
//     )
//   );
// };

// API routes
// Example: Get all posts
app.get("/posts", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts");
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching posts." });
  }
});

// Example: Get a single post
app.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await db.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Post Not Found!" });
    }
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching post." });
  }
});

// Example: Create a new post
app.post("/posts", upload.single("image"), async (req, res) => {
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-GB", options);
  let imagePath = req.file
    ? req.file.path.replace(/\\/g, "/")
    : "/images/i1.jpg";
  try {
    const newPost = await db.query(
      "INSERT INTO posts (title, content, date, imagePath) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.body.title, req.body.content, formattedDate, imagePath]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error creating new post." });
  }
});

// Example: Update a post
app.put("/posts/:id", upload.single("image"), async (req, res) => {
  const postId = req.params.id;
  const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-GB", options);

  try {
    const updateQuery = {
      text:
        "UPDATE posts SET title = $1, content = $2, date = $3" +
        (imagePath ? ", imagePath = $4" : "") +
        " WHERE id = $5 RETURNING *",
      values: imagePath
        ? [req.body.title, req.body.content, formattedDate, imagePath, postId]
        : [req.body.title, req.body.content, formattedDate, postId],
    };

    const updatedPost = await db.query(updateQuery);
    if (updatedPost.rows.length === 0) {
      return res.status(404).json({ message: "Post Not Found!" });
    }
    res.json(updatedPost.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error updating post." });
  }
});

// Example: Delete a post
app.delete("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const deleteQuery = await db.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [postId]
    );
    if (deleteQuery.rowCount === 0) {
      return res.status(404).json({ message: "Post Not Found!" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error deleting post." });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
