const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Bookmark = require("./models/bookmark");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/bookmarks");



/* SAVE BOOKMARK */

app.post("/bookmark", async (req,res)=>{

    const bookmark = new Bookmark(req.body);

    await bookmark.save();

    res.json({message:"Bookmark saved"});

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