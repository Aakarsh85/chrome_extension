//models/bookmark.js
const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({

    title: String,
    url: String,
    group: String,
    tags: [String],

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Bookmark", BookmarkSchema);