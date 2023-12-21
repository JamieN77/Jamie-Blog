import express from "express";
import bodyParser from "body-parser";
import postRoutes from "./routes/postRoutes.js"; // Adjust the path as necessary

const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));

// Use routes from postRoutes
app.use("/", postRoutes);

// Static files middleware
app.use(express.static("public"));
app.use("/userimg", express.static("userimg"));

// Start the server
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
