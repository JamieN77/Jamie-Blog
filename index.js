import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import pg from "pg";
import cors from "cors";
import moment from "moment";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import session from "express-session";
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

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true when I use HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await db.query(
          "SELECT * FROM users WHERE googleId = $1",
          [profile.id]
        );
        if (existingUser.rows.length > 0) {
          return done(null, existingUser.rows[0]);
        }

        const newUser = await db.query(
          "INSERT INTO users (googleId, email) VALUES ($1, $2) RETURNING *",
          [profile.id, profile.emails[0].value]
        );
        done(null, newUser.rows[0]);

        // If user is found or created, attach user to the session
        req.login(newUser.rows[0], (err) => {
          if (err) return done(err);
          return done(null, newUser.rows[0]);
        });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// API routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication
    // You can issue a token here or start a session
    res.redirect("/"); // Redirect to the desired page after login
  }
);

app.get("logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

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

app.post("/register", async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  // Verify the reCAPTCHA response
  const verifyCaptcha = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`,
    {
      method: "POST",
    }
  );
  const captchaResponse = await verifyCaptcha.json();

  if (!captchaResponse.success) {
    return res.status(400).json({ message: "Captcha verification failed" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error registering new user" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length > 0) {
      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].password
      );
      if (validPassword) {
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
        res.json({ token });
      } else {
        res.status(400).json({ message: "Invalid password" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error logging in user" });
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
