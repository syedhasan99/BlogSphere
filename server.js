import express from "express";
import bodyParser from "body-parser";
import { Post } from "./post.js";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({extended: true}))


// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be saved in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads"); // Create uploads folder if it doesn't exist
}

let blogPosts = [];

app.post("/add-post", upload.single('file') ,async (req, res) => {
  const { title, content } = req.body;

  let filePath = req.file ? req.file.path : null;

  if (!title ||!content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const post = await Post.create({
      title,
      content,
      image: filePath,
    });
    res.status(201).json({ message: "Post added!", post });
  } catch (error) {
    res.status(500).json({ error: "Failed to add post." });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.json(posts);
} catch (error) {
    res.status(500).json({ error: "Failed to fetch posts." });
}
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
