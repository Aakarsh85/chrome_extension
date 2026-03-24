const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Bookmark = require("./models/bookmark");

const app = express();

const User = require("./models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

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

app.post("/bookmark", async (req,res)=>{

    const bookmark = new Bookmark(req.body);

    await bookmark.save();

    res.json({message:"Bookmark saved"});

});

/*POST BOOKMARK*/

app.put("/bookmark/:id", async (req, res) => {
  try {
    const { title } = req.body;

    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      { title: title },
      { new: true }
    );

    if (!updatedBookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json(updatedBookmark);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET ALL BOOKMARKS */

app.get("/bookmarks", async (req,res)=>{

    const bookmarks = await Bookmark.find();

    res.json(bookmarks);

});



/* DELETE BOOKMARK */

app.delete("/bookmark/:id", async (req,res)=>{

    await Bookmark.findByIdAndDelete(req.params.id);

    res.json({message:"Bookmark deleted"});

});



app.listen(3000, ()=>{

    console.log("Server running on port 3000");

});