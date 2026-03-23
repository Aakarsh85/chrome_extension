const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({

    title: String,
    url: String,
    group: String,   // now dynamic
    userId: String,

    createdAt: {
        type: Date,
        default: Date.now
    }

});
module.exports = mongoose.model("Bookmark", BookmarkSchema);
//C:\Users\acer\Desktop\extension backend