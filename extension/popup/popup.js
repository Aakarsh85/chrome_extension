const saveBtn = document.getElementById("saveBtn");
const bookmarkList = document.getElementById("bookmarkList");
const searchInput = document.getElementById("searchInput");
const groupSelect = document.getElementById("groupSelect");

const logo = document.getElementById("logo");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

const accountBtn = document.getElementById("accountBtn");
const helpBtn = document.getElementById("helpBtn");
const settingsBtn = document.getElementById("settingsBtn");



/* -----------------------------
SMART AUTO CATEGORIZATION
----------------------------- */

function detectGroup(title, url){

    const text = (title + " " + url).toLowerCase();

    if(text.includes("leetcode") || text.includes("github") || text.includes("algorithm"))
        return "Coding";

    if(text.includes("kaggle") || text.includes("arxiv") || text.includes("research"))
        return "Research";

    if(text.includes("tutorial") || text.includes("course") || text.includes("youtube"))
        return "Learning";

    if(text.includes("amazon") || text.includes("product"))
        return "Shopping";

    return groupSelect.value;

}



/* -----------------------------
LOGO CLICK
----------------------------- */

logo.addEventListener("click", () => {

    console.log("Logo clicked");

    chrome.tabs.create({
        url: "https://aakarsh85.github.io/chrome_extension/"
    });

});
/* -----------------------------
MENU TOGGLE
----------------------------- */

menuBtn.addEventListener("click", () => {

    menu.classList.toggle("hidden");

});



/* -----------------------------
OPEN MENU PAGES
----------------------------- */

accountBtn.addEventListener("click", () => {

    chrome.tabs.create({
        url: chrome.runtime.getURL("pages/account.html")
    });

});

helpBtn.addEventListener("click", () => {

    chrome.tabs.create({
        url: chrome.runtime.getURL("pages/help.html")
    });

});

settingsBtn.addEventListener("click", () => {

    chrome.tabs.create({
        url: chrome.runtime.getURL("pages/settings.html")
    });

});



/* -----------------------------
SAVE CURRENT PAGE
----------------------------- */

saveBtn.addEventListener("click", () => {

    chrome.tabs.query({active:true,currentWindow:true}, (tabs)=>{

        const tab = tabs[0];

        const group = detectGroup(tab.title, tab.url);

        const bookmark = {
            title: tab.title,
            url: tab.url,
            group: group
        };

        chrome.storage.local.get("bookmarks", (data)=>{

            const bookmarks = data.bookmarks || [];

            const exists = bookmarks.some(b => b.url === bookmark.url);

            if(exists){

                alert("Bookmark already saved");

                return;

            }

            bookmarks.push(bookmark);

            chrome.storage.local.set({bookmarks}, ()=>{

                loadBookmarks();

            });

        });

    });

});



/* -----------------------------
LOAD BOOKMARKS
----------------------------- */

function loadBookmarks(){

    chrome.storage.local.get("bookmarks", (data)=>{

        const bookmarks = data.bookmarks || [];

        bookmarkList.innerHTML = "";

        loadStats(bookmarks);

        bookmarks.forEach((b, index)=>{

            const item = document.createElement("div");

            item.className = "bookmark";

            const favicon = document.createElement("img");
            favicon.src = "https://www.google.com/s2/favicons?domain=" + b.url;

            const title = document.createElement("span");
            title.textContent = b.title;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "✕";

            deleteBtn.onclick = (e)=>{

                e.stopPropagation();

                deleteBookmark(index);

            };

            item.appendChild(favicon);
            item.appendChild(title);
            item.appendChild(deleteBtn);

            item.onclick = ()=>{

                chrome.tabs.create({url:b.url});

            };

            bookmarkList.appendChild(item);

        });

    });

}



/* -----------------------------
DELETE BOOKMARK
----------------------------- */

function deleteBookmark(index){

    chrome.storage.local.get("bookmarks", (data)=>{

        const bookmarks = data.bookmarks || [];

        bookmarks.splice(index,1);

        chrome.storage.local.set({bookmarks}, ()=>{

            loadBookmarks();

        });

    });

}



/* -----------------------------
BOOKMARK STATISTICS
----------------------------- */

function loadStats(bookmarks){

    const statsContainer = document.getElementById("stats");

    const stats = {};

    bookmarks.forEach(b=>{

        if(!stats[b.group]){

            stats[b.group] = 0;

        }

        stats[b.group]++;

    });

    let html = "<strong>Bookmark Stats</strong><br>";

    for(let group in stats){

        html += group + " → " + stats[group] + "<br>";

    }

    statsContainer.innerHTML = html;

}



/* -----------------------------
SEARCH
----------------------------- */

searchInput.addEventListener("input", ()=>{

    const query = searchInput.value.toLowerCase();

    chrome.storage.local.get("bookmarks", (data)=>{

        const bookmarks = data.bookmarks || [];

        bookmarkList.innerHTML = "";

        bookmarks
        .filter(b => b.title.toLowerCase().includes(query))
        .forEach(b=>{

            const div = document.createElement("div");

            div.className="bookmark";

            div.textContent=b.title;

            div.onclick=()=>{

                chrome.tabs.create({url:b.url});

            };

            bookmarkList.appendChild(div);

        });

    });

});



/* -----------------------------
INITIAL LOAD
----------------------------- */

loadBookmarks();
