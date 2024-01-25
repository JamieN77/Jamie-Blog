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

  const defaultAvatarPath = "userimg/default-avatar.png";

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@#$%^&*]{8,}$/;
    return re.test(password);
  };

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

  // Validate password
  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include 1 lowercase letter, 1 uppercase letter, 1 digit, and cannot contain special characters other than @#$%^&*.",
    });
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

// Endpoint to set or update user's password
app.put("/user/password", async (req, res) => {
  const userId = req.user?.id; // Assuming you have middleware to set req.user
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { password } = req.body;

  // Check for password validity
  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@#$%^&*]{8,}$/;
    return re.test(password);
  };

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include 1 lowercase letter, 1 uppercase letter, and 1 digit and cannot contain special characters other than @#$%^&*.",
    });
  }

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);
    res.status(200).json({ message: "Password set successfully" });
  } catch (err) {
    console.error("Error setting password", err.stack);
    res.status(500).json({ message: "Error setting password" });
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

// Search
app.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const limit = parseInt(req.query.limit) || 10; // Default limit
    const page = parseInt(req.query.page) || 1; // Default page
    const offset = (page - 1) * limit;

    // Query to get filtered results with pagination
    const searchResultsQuery = `
      SELECT * FROM posts 
      WHERE title ILIKE $1 OR content ILIKE $1
      LIMIT $2 OFFSET $3
    `;
    const searchResults = await db.query(searchResultsQuery, [
      `%${searchQuery}%`,
      limit,
      offset,
    ]);

    // Query to get the total count of matching results
    const totalCountQuery = `
      SELECT COUNT(*) FROM posts 
      WHERE title ILIKE $1 OR content ILIKE $1
    `;
    const totalCountResult = await db.query(totalCountQuery, [
      `%${searchQuery}%`,
    ]);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    res.json({ posts: searchResults.rows, totalCount });
  } catch (err) {
    console.error("Error executing search query", err.stack);
    res.status(500).json({ message: "Error performing search." });
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

// Route to get n random categories with post count, excluding specified categories
app.get("/categories/random", async (req, res) => {
  const count = parseInt(req.query.count) || 3; // Default to 3 if not specified
  const exclude = req.query.exclude ? req.query.exclude.split(",") : [];

  try {
    // Fetch n random categories, excluding the specified ones
    const categoriesResult = await db.query(
      `
        SELECT id, name FROM categories
        WHERE id NOT IN (SELECT unnest($1::int[]))
        ORDER BY RANDOM()
        LIMIT $2
      `,
      [exclude.length > 0 ? exclude : null, count]
    );

    const categories = categoriesResult.rows;

    // For each category, count the number of posts
    for (let category of categories) {
      const postCountResult = await db.query(
        `
          SELECT COUNT(*) FROM post_categories
          WHERE category_id = $1
        `,
        [category.id]
      );
      category.postCount = parseInt(postCountResult.rows[0].count);
    }

    res.json(categories);
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

// Route to get n random tags with post count
app.get("/tags/random", async (req, res) => {
  const count = parseInt(req.query.count) || 8;
  const exclude = req.query.exclude
    ? req.query.exclude.split(",").map(Number)
    : [];

  try {
    // Fetch n random tags excluding the ones provided
    const tagsResult = await db.query(
      `
        SELECT id, name FROM tags
        WHERE NOT id = ANY($1)
        ORDER BY RANDOM()
        LIMIT $2
      `,
      [exclude, count]
    );

    const tags = tagsResult.rows;

    // For each tag, count the number of posts
    for (let tag of tags) {
      const postCountResult = await db.query(
        `
          SELECT COUNT(*) FROM post_tags
          WHERE tag_id = $1
        `,
        [tag.id]
      );
      tag.postCount = parseInt(postCountResult.rows[0].count);
    }

    res.json(tags);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching tags." });
  }
});

// GET user info
app.get("/user/info", async (req, res) => {
  const userId = req.user?.id; // Assuming you're using some authentication middleware to set req.user
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const userInfo = await db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userInfo.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userInfo.rows[0]);
  } catch (err) {
    console.error("Error fetching user info", err.stack);
    res.status(500).json({ message: "Error fetching user info" });
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

// Get All Posts
app.get("/posts", async (req, res) => {
  const categoryIds = req.query.categories
    ? req.query.categories.split(",").map(Number) // Convert to numbers
    : [];
  const tagIds = req.query.tags
    ? req.query.tags.split(",").map(Number) // Convert to numbers
    : [];
  const limit = parseInt(req.query.limit) || 3;
  const offset = parseInt(req.query.offset) || 0;

  let sqlQuery = `
    SELECT p.*, u.display_name,
      ARRAY(
        SELECT name FROM categories WHERE id IN (
          SELECT category_id FROM post_categories WHERE post_id = p.id
        )
      ) AS categories,
      ARRAY(
        SELECT name FROM tags WHERE id IN (
          SELECT tag_id FROM post_tags WHERE post_id = p.id
        )
      ) AS tags,`;

  let params = [];
  let paramCounter = 1;

  if (categoryIds.length > 0 || tagIds.length > 0) {
    sqlQuery += `COALESCE((SELECT SUM(score) FROM (`;

    if (categoryIds.length > 0) {
      sqlQuery += `SELECT 3 AS score FROM post_categories pc WHERE pc.post_id = p.id AND pc.category_id = ANY($${paramCounter}::int[]) `;
      params.push(categoryIds);
      paramCounter++;
    }

    if (tagIds.length > 0) {
      if (categoryIds.length > 0) {
        sqlQuery += `UNION ALL `;
      }
      sqlQuery += `SELECT 1.5 AS score FROM post_tags pt WHERE pt.post_id = p.id AND pt.tag_id = ANY($${paramCounter}::int[]) `;
      params.push(tagIds);
      paramCounter++;
    }

    sqlQuery += `) AS subquery), 0) AS relevance_score `;
  } else {
    sqlQuery += `0 AS relevance_score `;
  }

  // Adding popular_point calculation
  sqlQuery += `,
    COALESCE((
      SELECT SUM(CASE WHEN endorsement THEN 1 ELSE -1 END)
      FROM post_endorsements
      WHERE post_id = p.id
    ), 0) AS popular_point
  `;

  sqlQuery += `
    FROM posts p
    JOIN users u ON p.user_id = u.id
    GROUP BY p.id, u.display_name
    ORDER BY relevance_score DESC NULLS LAST, p.date DESC
    LIMIT $${paramCounter++} OFFSET $${paramCounter}`;

  params.push(limit, offset);

  try {
    const result = await db.query(sqlQuery, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching posts." });
  }
});

// Get the latest posts
app.get("/posts-latest", async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5; // Use query parameter or default to 5
    const sqlQuery = `
      SELECT * FROM posts
      ORDER BY date DESC
      LIMIT $1`;

    const result = await db.query(sqlQuery, [count]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching latest posts." });
  }
});

app.get("/posts/count", async (req, res) => {
  const categoryIds = req.query.categories
    ? req.query.categories.split(",").map(Number)
    : null;
  const tagIds = req.query.tags ? req.query.tags.split(",").map(Number) : null;

  let sqlQuery = `
    SELECT COUNT(DISTINCT p.id)
    FROM posts p
    LEFT JOIN post_categories pc ON p.id = pc.post_id
    LEFT JOIN categories c ON pc.category_id = c.id
    LEFT JOIN post_tags pt ON p.id = pt.post_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE ($1::int[] IS NULL OR pc.category_id = ANY($1::int[]))
    AND ($2::int[] IS NULL OR pt.tag_id = ANY($2::int[]))
  `;

  try {
    const params = [
      categoryIds && categoryIds.length > 0 ? categoryIds : null,
      tagIds && tagIds.length > 0 ? tagIds : null,
    ];

    const result = await db.query(sqlQuery, params);
    const postCount = result.rows[0].count;
    res.json({ count: parseInt(postCount, 10) });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching post count." });
  }
});

// Post's popular point
app.post("/posts/:postId/endorse", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?.id;
  // Check if the user is authenticated
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  const { endorsement } = req.body; // true for endorse, false for dis-endorse

  try {
    const query = `
      INSERT INTO post_endorsements (post_id, user_id, endorsement)
      VALUES ($1, $2, $3)
      ON CONFLICT (post_id, user_id) 
      DO UPDATE SET endorsement = EXCLUDED.endorsement;
    `;
    await db.query(query, [postId, userId, endorsement]);
    res.status(200).json({ message: "Endorsement updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating endorsement" });
  }
});

// Endpoint to check if a user has endorsed/dis-endorsed a post
app.get("/posts/:postId/endorsement-status", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const query = `
      SELECT endorsement FROM post_endorsements
      WHERE post_id = $1 AND user_id = $2;
    `;
    const result = await db.query(query, [postId, userId]);
    if (result.rows.length > 0) {
      res.json({ endorsement: result.rows[0].endorsement });
    } else {
      res.json({ endorsement: null });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching endorsement status" });
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
           array_agg(DISTINCT t.name) AS tags,
           COALESCE((
             SELECT SUM(CASE WHEN endorsement THEN 1 ELSE -1 END)
             FROM post_endorsements
             WHERE post_id = p.id
           ), 0) AS popular_point
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
           array_agg(DISTINCT t.name) AS tags,
           COALESCE((
             SELECT SUM(CASE WHEN endorsement THEN 1 ELSE -1 END)
             FROM post_endorsements
             WHERE post_id = p.id
           ), 0) AS popular_point
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
           array_agg(DISTINCT t.name) AS tags,
           COALESCE((
             SELECT SUM(CASE WHEN endorsement THEN 1 ELSE -1 END)
             FROM post_endorsements
             WHERE post_id = p.id
           ), 0) AS popular_point
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
    : "/images/default-post.png";

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
