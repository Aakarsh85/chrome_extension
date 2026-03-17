/* -------------------------------
GET ALL BOOKMARKS
-------------------------------- */

function getBookmarks(callback){

    chrome.storage.local.get("bookmarks", (data)=>{

        const bookmarks = data.bookmarks || [];

        callback(bookmarks);

    });

}



/* -------------------------------
SAVE BOOKMARK LIST
-------------------------------- */

function saveBookmarks(bookmarks, callback){

    chrome.storage.local.set({bookmarks}, ()=>{

        if(callback) callback();

    });

}



/* -------------------------------
ADD BOOKMARK
-------------------------------- */

function addBookmark(bookmark, callback){

    getBookmarks((bookmarks)=>{

        const exists = bookmarks.some(b => b.url === bookmark.url);

        if(exists){
            console.log("Bookmark already exists");
            return;
        }

        bookmarks.push(bookmark);

        saveBookmarks(bookmarks, callback);

    });

}



/* -------------------------------
DELETE BOOKMARK
-------------------------------- */

function deleteBookmark(index, callback){

    getBookmarks((bookmarks)=>{

        bookmarks.splice(index,1);

        saveBookmarks(bookmarks, callback);

    });

}



/* -------------------------------
SEARCH BOOKMARKS
-------------------------------- */

function searchBookmarks(query, callback){

    getBookmarks((bookmarks)=>{

        const results = bookmarks.filter(b =>
            b.title.toLowerCase().includes(query.toLowerCase())
        );

        callback(results);

    });

}