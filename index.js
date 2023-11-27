import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";

const app = express();
const port = 3000;

var posts = [];

app.use(bodyParser.urlencoded({ extended: true }));

// Get
app.get("/", (req, res) => {
  res.render("index.ejs", { posts: posts });
});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.get("/edit/:id", (req, res) => {
  const postId = req.params.id;
  const post = posts.find((p, index) => index.toString() === postId);
  if (post) {
    res.render("edit.ejs", { post: post, postId: postId });
  } else {
    res.status(404).send("Page Not Found!");
  }
});

app.get("/article/:id", (req, res) => {
  const postId = req.params.id;
  const post = posts.find((p, index) => index.toString() === postId);
  if (post) {
    res.render("article.ejs", { post: post, postId: postId });
  } else {
    res.status(404).send("Post Not Found!");
  }
});

// Post
app.use(express.static("public")); // must be placed after get
app.use("/userimg", express.static("userimg"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "userimg/");
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with the original extension
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const options = { day: "2-digit", month: "short", year: "numeric" };

app.post("/create", upload.single("image"), (req, res) => {
  // logic to handle creation
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-GB", options);
  let imagePath;
  if (req.file) {
    imagePath = req.file.path;
  } else {
    imagePath = "/images/i1.jpg";
  }
  const newPost = {
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath.replace(/\\/g, "/"),
    date: formattedDate,
  };
  posts.push(newPost);
  res.redirect("/");
});
// Patch
// Put
// Delete

app.post("/edit/:id", upload.single("image"), (req, res) => {
  const postId = req.params.id;

  // Find the post to be updated
  const post = posts[postId];
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-GB", options);

  // Check if a new image was uploaded
  if (req.file) {
    // New image uploaded, update the image path
    post.imagePath = req.file.path.replace(/\\/g, "/");
  } // else, keep the existing image path

  // Update the other post details
  post.title = req.body.title;
  post.content = req.body.content;
  post.Date = formattedDate;
  res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
  const postId = req.params.id;

  posts.splice(postId, 1);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
