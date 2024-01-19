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
import LocalStrategy from "passport-local";
import fs from "fs";
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
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

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
          "SELECT * FROM users WHERE googleid = $1",
          [profile.id]
        );
        if (existingUser.rows.length > 0) {
          return done(null, existingUser.rows[0]);
        }

        const newUser = await db.query(
          "INSERT INTO users (googleid, email, display_name) VALUES ($1, $2, $3) RETURNING *",
          [profile.id, profile.emails[0].value, profile.displayName]
        );
        return done(null, newUser.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (email, password, done) => {
      db.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
        (err, result) => {
          if (err) {
            return done(err);
          }
          if (!result.rows.length) {
            return done(null, false, { message: "Incorrect username." });
          }

          bcrypt.compare(password, result.rows[0].password, (err, res) => {
            if (res) {
              // passwords math! log user in
              return done(null, result.rows[0]);
            } else {
              // passwords do not match!
              return done(null, false, { message: "Incorrect password." });
            }
          });
        }
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
    if (err) return done(err);
    done(null, result.rows[0]);
  });
});

// API routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.login(req.user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("http://localhost:3000"); // Redirect to the desired page after login
    });
  }
);

app.get("/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    // Assuming the user's email is stored in the user object
    res.json(req.user);
  } else {
    res.status(401).send("User not authenticated");
  }
});

app.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid", { path: "/" });
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

// Register
app.post("/register", async (req, res) => {
  const { email, password, displayName, recaptchaToken } = req.body;

  const defaultAvatarPath = "/images/i1.jpg";

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
      "INSERT INTO users (email, password, display_name, bio, avatar_path) VALUES ($1, $2, $3, '', $4) RETURNING *",
      [email, hashedPassword, displayName, defaultAvatarPath]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error registering new user" });
  }
});

// Login
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Login error:", err);
      return next(err);
    }
    if (!user) {
      console.error("Login failed, user not found or incorrect credentials");
      return res.status(401).json({ message: info.message });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error("Error logging in:", loginErr);
        return next(loginErr);
      }
      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 3 * 24 * 60 * 60 * 1000; // Extend to 3 days
      } else {
        req.session.cookie.expires = false; // Use default session expiry
      }

      console.log("User logged in successfully:", user);
      return res.json({
        message: "Logged in successfully",
        user: {
          email: req.user.email,
          display_name: req.user.display_name, // Assuming the display name is stored in this field
        },
      });
    });
  })(req, res, next);
});

// Route to update user profile (bio, display_name)
app.put("/user/profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const updatedUser = await db.query(
      "UPDATE users SET display_name = $1, bio = $2 WHERE id = $3 RETURNING *",
      [req.body.display_name, req.body.bio, req.user.id]
    );
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error("Error executing query when updating profile", err.stack);
    res.status(500).json({ message: "Error updating profile." });
  }
});

// Endpoint to update user avatar
app.put("/user/profile/avatar", upload.single("avatar"), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Fetch the current user to get the existing avatar path
    const currentUserResult = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );
    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    const currentUser = currentUserResult.rows[0];
    const oldAvatarPath = currentUser.avatar_path;

    // Delete the old avatar file
    if (oldAvatarPath && fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }

    const avatarPath = `userimg/${req.file.filename}`; // Construct the path where the image is stored
    const updatedUser = await db.query(
      "UPDATE users SET avatar_path = $1 WHERE id = $2 RETURNING *",
      [avatarPath, req.user.id]
    );
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error("Error executing query when updating avatar", err.stack);
    res.status(500).json({ message: "Error updating avatar." });
  }
});

// HeroBanner daily info
app.get("/herobanner/daily", async (req, res) => {
  try {
    // Fetch all records from herobanner table
    const result = await db.query(
      "SELECT id, image_path, topic FROM herobanner ORDER BY id"
    );
    const banners = result.rows;

    if (banners.length === 0) {
      return res.status(404).json({ message: "No hero banners found" });
    }

    // Calculate the index based on the current date
    const today = moment().format("YYYY-MM-DD");
    const startDate = moment("2024-01-01"); // Start Date
    const daysSinceStart = moment(today).diff(startDate, "days");
    const bannerIndex = daysSinceStart % banners.length;

    // Return the hero banner for the current day
    const currentBanner = banners[bannerIndex];
    res.json({ ...currentBanner, date: today });
  } catch (err) {
    console.error("Error exeuting query", err.stack);
    res.status(500).json({ message: "Error fetching daily hero banner." });
  }
});

// Categories and tags
app.get("/categories", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories");
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching categories." });
  }
});

app.get("/tags", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tags");
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching tags." });
  }
});

// Route to get user avatar image_path
app.get("/user/avatar/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      "SELECT avatar_path FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length > 0) {
      const avatarPath = result.rows[0].avatar_path;
      res.json({ avatarPath });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error retrieving user avatar." });
  }
});

// Get all posts
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

  const sqlQuery = `
    SELECT p.*, u.display_name, 
           array_agg(DISTINCT c.name) AS categories, 
           array_agg(DISTINCT t.name) AS tags
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id, u.display_name
    ORDER BY p.${sort} ${order}`;

  try {
    const result = await db.query(sqlQuery);
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching posts." });
  }
});

// Get all posts of a user
app.get("/my/posts", async (req, res) => {
  const userId = req.user?.id; // Get the authenticated user's ID

  // Check if the user is authenticated
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

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

  const sqlQuery = `
    SELECT p.*, u.display_name, 
           array_agg(DISTINCT c.name) AS categories, 
           array_agg(DISTINCT t.name) AS tags
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.user_id = $1 
    GROUP BY p.id, u.display_name
    ORDER BY p.${sort} ${order}`;

  try {
    const result = await db.query(sqlQuery, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching posts." });
  }
});

// Get n random posts
app.get("/posts/random", async (req, res) => {
  // Get the count from query parameters or default to 3
  const count = parseInt(req.query.count) || 3;

  const sqlQuery = `
    SELECT p.*, u.display_name, 
           array_agg(DISTINCT c.name) AS categories, 
           array_agg(DISTINCT t.name) AS tags
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id, u.display_name
    ORDER BY RANDOM() LIMIT $1`;

  try {
    const result = await db.query(sqlQuery, [count]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching random posts." });
  }
});

// Get a single post
app.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const sqlQuery = `
    SELECT p.*, u.display_name, 
           array_agg(DISTINCT c.name) AS categories, 
           array_agg(DISTINCT t.name) AS tags
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = $1
    GROUP BY p.id, u.display_name`;
    const result = await db.query(sqlQuery, [postId]);
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

// Create a new post
app.post("/posts", upload.single("image"), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { title, content } = req.body;
  const categories = JSON.parse(req.body.categories || "[]"); // Parse the JSON string
  const tags = JSON.parse(req.body.tags || "[]"); // Parse the JSON string
  const date = moment().format("YYYY-MM-DD HH:mm:ss");
  let imagePath = req.file
    ? req.file.path.replace(/\\/g, "/")
    : "/images/i1.jpg";

  // Retrieve the user's ID from the session
  const userId = req.user.id;
  try {
    // Begin a transaction
    await db.query("BEGIN");

    // Insert the new post into the posts table
    const newPostQuery = `
      INSERT INTO posts (title, content, date, imagePath, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`; // Returning the new post ID for further use
    const newPostResult = await db.query(newPostQuery, [
      title,
      content,
      date,
      imagePath,
      userId,
    ]);
    const newPostId = newPostResult.rows[0].id;

    // Insert categories and tags if provided
    if (categories) {
      for (const category of categories) {
        const insertCategoryQuery = `
          INSERT INTO post_categories (post_id, category_id)
          SELECT $1, id FROM categories WHERE name = $2`;
        await db.query(insertCategoryQuery, [newPostId, category]);
      }
    }

    if (tags) {
      for (const tag of tags) {
        const insertTagQuery = `
          INSERT INTO post_tags (post_id, tag_id)
          SELECT $1, id FROM tags WHERE name = $2`;
        await db.query(insertTagQuery, [newPostId, tag]);
      }
    }

    // Commit the transaction
    await db.query("COMMIT");

    res.status(201).json(newPostResult.rows[0]);
  } catch (err) {
    // If an error occurs, rollback the transaction
    await db.query("ROLLBACK");
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error creating new post." });
  }
});

// Update a post
app.put("/posts/:id", upload.single("image"), async (req, res) => {
  const postId = req.params.id;
  const userId = req.user?.id; // Get the authenticated user's ID
  const { title, content } = req.body;
  const categories = JSON.parse(req.body.categories || "[]"); // Parse the JSON string
  const tags = JSON.parse(req.body.tags || "[]"); // Parse the JSON string

  // Check if the user is authenticated
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // Begin a transaction
    await db.query("BEGIN");

    // Update the post
    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");

    let updatePostQuery = `
      UPDATE posts SET title = $1, content = $2, date = $3 WHERE id = $4 RETURNING *`;
    let queryParams = [title, content, date, postId];

    if (imagePath) {
      updatePostQuery = `
        UPDATE posts SET title = $1, content = $2, date = $3, imagepath = $4 WHERE id = $5 RETURNING *`;
      queryParams.splice(3, 0, imagePath);
    }

    const updatedPostResult = await db.query(updatePostQuery, queryParams);

    // Update categories and tags
    // Remove existing categories and tags
    await db.query("DELETE FROM post_categories WHERE post_id = $1", [postId]);
    await db.query("DELETE FROM post_tags WHERE post_id = $1", [postId]);

    // Add new categories and tags
    if (categories) {
      for (const category of categories) {
        await db.query(
          `INSERT INTO post_categories (post_id, category_id)
           SELECT $1, id FROM categories WHERE name = $2`,
          [postId, category]
        );
      }
    }

    if (tags) {
      for (const tag of tags) {
        await db.query(
          `INSERT INTO post_tags (post_id, tag_id)
           SELECT $1, id FROM tags WHERE name = $2`,
          [postId, tag]
        );
      }
    }

    // Commit the transaction
    await db.query("COMMIT");

    res.json(updatedPostResult.rows[0]);
  } catch (err) {
    // Rollback the transaction on error
    await db.query("ROLLBACK");
    console.error("Error during post update transaction", err.stack);
    res.status(500).json({ message: "Error updating post." });
  }
});

// Delete a post
app.delete("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    // Auth check
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Ensure the post belongs to the user
    const postCheck = await db.query(
      "SELECT * FROM posts WHERE id = $1 AND user_id = $2",
      [postId, userId]
    );

    if (postCheck.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Post Not Found or Unauthorized!" });
    }

    // Begin a transaction
    await db.query("BEGIN");

    // Delete related categories and tags
    await db.query("DELETE FROM post_categories WHERE post_id = $1", [postId]);
    await db.query("DELETE FROM post_tags WHERE post_id = $1", [postId]);

    // Delete the post
    await db.query("DELETE FROM posts WHERE id = $1", [postId]);

    // Commit the transaction
    await db.query("COMMIT");

    res.status(204).send();
  } catch (err) {
    // If an error occurs, rollback the transaction
    await db.query("ROLLBACK");
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error deleting post." });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
