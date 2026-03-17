// Runs when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("Smart Bookmark Extension Installed");
});



/* --------------------------------
SMART CATEGORY DETECTION
-------------------------------- */

function categorizeBookmark(title, url){

    const text = (title + " " + url).toLowerCase();

    if(text.includes("leetcode") || text.includes("github") || text.includes("algorithm"))
        return "Coding";

    if(text.includes("kaggle") || text.includes("arxiv") || text.includes("research"))
        return "Research";

    if(text.includes("tutorial") || text.includes("course") || text.includes("youtube"))
        return "Learning";

    if(text.includes("amazon") || text.includes("product"))
        return "Shopping";

    return "General";

}



/* --------------------------------
SAVE BOOKMARK FUNCTION
-------------------------------- */

function saveBookmark(tab){

    const group = categorizeBookmark(tab.title, tab.url);

    const bookmark = {
        title: tab.title,
        url: tab.url,
        group: group,
        date: new Date().toISOString()
    };

    chrome.storage.local.get("bookmarks", (data)=>{

        const bookmarks = data.bookmarks || [];

        const exists = bookmarks.some(b => b.url === bookmark.url);

        if(exists){
            console.log("Bookmark already exists");
            return;
        }

        bookmarks.push(bookmark);

        chrome.storage.local.set({bookmarks}, ()=>{
            console.log("Bookmark saved:", bookmark);
        });

    });

}



/* --------------------------------
KEYBOARD SHORTCUT
Ctrl + Shift + S
-------------------------------- */

chrome.commands.onCommand.addListener((command)=>{

    if(command === "save-bookmark"){

        chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{

            const tab = tabs[0];

            saveBookmark(tab);

        });

    }

});



/* --------------------------------
MESSAGES FROM POPUP
-------------------------------- */

chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{

    if(message.type === "SAVE_BOOKMARK"){

        chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{

            const tab = tabs[0];

            saveBookmark(tab);

        });

    }

});