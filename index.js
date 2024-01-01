import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import pg from "pg";
import cors from "cors";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
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

app.use(express.static("public"));
app.use("/userimg", express.static("userimg"));

// API routes
// Example: Get all posts
app.get("/posts", async (req, res) => {
  // Extract sort and order parameters from the query string
  // and provide default valus if they're not specified
  const sort = req.query.sort || "date";
  const order = req.query.order || "DESC";

  // Validate the sort and order to protect against SQL injection
  const validSortColumns = ["date", "id"];
  const validOrders = ["ASC", "DESC"];
  if (!validSortColumns.includes(sort) || !validOrders.includes(order)) {
    return res
      .status(400)
      .json({ message: "Invalid sort or order parameter." });
  }

  const sqlQuery = `SELECT * FROM posts ORDER BY ${sort} ${order}`;

  try {
    const result = await db.query(sqlQuery);
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
  const formattedDate = moment(date).format("YYYY-MM-DD HH:mm:ss");
  console.log(formattedDate);
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
  const formattedDate = moment(date).format("YYYY-MM-DD HH:mm:ss");

  try {
    const updateValues = [
      req.body.title,
      req.body.content,
      formattedDate,
      postId,
    ];
    let updateQueryText =
      "UPDATE posts SET title = $1, content = $2, date = $3 WHERE id = $4 RETURNING *";

    if (imagePath) {
      updateQueryText =
        "UPDATE posts SET title = $1, content = $2, date = $3, imagePath = $4 WHERE id = $5 RETURNING *";
      updateValues.splice(3, 0, imagePath); // Insert imagePath at the right position
    }

    const updatedPost = await db.query(updateQueryText, updateValues);
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
