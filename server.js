import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const port = 5000;
const API_BASE_URL = "http://localhost:4000";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts`);
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    res.status(500).send("Error fetching posts");
  }
});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/${req.params.id}`);
    res.render("edit.ejs", { post: response.data, postId: req.params.id });
  } catch (error) {
    res.status(500).send("Error fetching post");
  }
});

app.get("/article/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/${req.params.id}`);
    res.render("article.ejs", { post: response.data, postId: req.params.id });
  } catch (error) {
    res.status(500).send("Error fetching post");
  }
});

// POST route for creating a new post
app.post("/create", upload.single("image"), async (req, res) => {
  try {
    const formData = {
      title: req.body.title,
      content: req.body.content,
      image: req.file ? req.file.filename : undefined,
    };
    await axios.post(`${API_BASE_URL}/posts`, formData);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error creating post");
  }
});

// PUT route for updating a post
app.post("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const formData = {
      title: req.body.title,
      content: req.body.content,
      image: req.file ? req.file.filename : undefined,
    };
    await axios.put(`${API_BASE_URL}/posts/${req.params.id}`, formData);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error updating post");
  }
});

// DELETE route for deleting a post
app.post("/delete/:id", async (req, res) => {
  try {
    await axios.delete(`${API_BASE_URL}/posts/${req.params.id}`);
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error deleting post");
  }
});

app.use(express.static("public"));
app.use("/userimg", express.static("userimg"));

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
