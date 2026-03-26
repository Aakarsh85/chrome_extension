const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Bookmark = require("./models/bookmark");

const app = express();

const User = require("./models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";


/* Authentication */

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;   // 🔥 used in routes
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/bookmarks");


/* SIGNUP */

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User created" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* LOGIN */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* SAVE BOOKMARK */

app.post("/bookmark", auth, async (req, res) => {

    const { title, url, group } = req.body;

    const bookmark = new Bookmark({
        title,
        url,
        group,
        user: req.userId   // 🔥 THIS IS THE KEY CHANGE
    });

    await bookmark.save();

    res.json({ message: "Bookmark saved" });
});

/*POST BOOKMARK*/

app.put("/bookmark/:id", auth, async (req, res) => {
  try {
    const { title } = req.body;

    const updatedBookmark = await Bookmark.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId   // 🔥 ensures only owner can edit
      },
      { title },
      { new: true }
    );

    if (!updatedBookmark) {
      return res.status(404).json({ message: "Bookmark not found or not authorized" });
    }

    res.json(updatedBookmark);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET ALL BOOKMARKS */

app.get("/bookmarks", auth, async (req, res) => {
  const bookmarks = await Bookmark.find({
    user: req.userId
  });

  res.json(bookmarks);
});


/* DELETE BOOKMARK */

app.delete("/bookmark/:id", auth, async (req, res) => {

  await Bookmark.findOneAndDelete({

    _id: req.params.id,
    user: req.userId

  });

  res.json({message:"Bookmark deleted"});
});



app.listen(3000, ()=>{

    console.log("Server running on port 3000");

});