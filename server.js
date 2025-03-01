import express from "express";
import bodyParser from "body-parser";
import { Post } from "./models/post.js";
import { User } from "./models/user.js";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

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

const authenticate = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({message: "access denied."});

  try {
    let decoded = jwt.verify(token, "secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({message: "Invalid token!"});
  }
}

let blogPosts = [];

app.post("/add-post", authenticate, upload.single('file') ,async (req, res) => {
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

app.post('/register', async (req, res) => {
  let { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(500).send("User already exists.");
  
    
    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);

    let newUser = await User.create({ name, email, password: hashedPassword });

    let token = jwt.sign({ id: newUser._id }, "secret-key");
    // res.cookie('token', token);

    res.status(201).json({ message: "User registered successfully!", newUser, token });
    
  } catch (error) {
    res.status(500).json({ error }); 
  }
 
})

app.post('/login', async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found." });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({message: "Invalid credentials."});

    const token = jwt.sign({id: user._id}, "secret-key");
    // res.cookie('token', token)
    res.status(200).json({ message: "Login successful!", user, token });
    
  } catch (error) {
    res.status(500).json({ message: "Login failed"});
  }

})

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
