document.addEventListener("DOMContentLoaded", () => {

const saveBtn = document.getElementById("saveBtn");
const bookmarkList = document.getElementById("bookmarkList");
const searchInput = document.getElementById("searchInput");
const groupInput = document.getElementById("groupInput");

const tagInput = document.getElementById("tagInput");

const logo = document.getElementById("logo");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

const accountBtn = document.getElementById("accountBtn");
const helpBtn = document.getElementById("helpBtn");
const settingsBtn = document.getElementById("settingsBtn");

// const authSection = document.getElementById("authSection");
// const appSection = document.getElementById("appSection");

// const loginBtn = document.getElementById("loginBtn");
// const signupBtn = document.getElementById("signupBtn");

// const emailInput = document.getElementById("email");
// const passwordInput = document.getElementById("password");


let allBookmarks = [];
/* -----------------------------
LOGIN CHECK 
----------------------------- */

chrome.storage.local.get("token", (data) => {

    if (!data.token) {
        bookmarkList.innerHTML = "<p>Please login from Account</p>";
        return;
    }

    loadBookmarks();   // 🔥 ALWAYS load bookmarks

});

/* -----------------------------
LOGO CLICK → OPEN WEBSITE
----------------------------- */

logo.addEventListener("click", () => {

    chrome.tabs.create({
        url: chrome.runtime.getURL("pages/dashboard.html")
    });

});


/* -----------------------------
MENU TOGGLE
----------------------------- */

menuBtn.addEventListener("click", () => {

    menu.classList.toggle("hidden");

});



/* -----------------------------
OPEN PAGES
----------------------------- */

accountBtn.addEventListener("click", () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("pages/account.html")
    });
});

helpBtn.addEventListener("click", () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("pages/dashboard.html")
    });
});

settingsBtn.addEventListener("click", () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("pages/dashboard.html")
    });
});


/* -----------------------------
SAVE CURRENT PAGE
----------------------------- */

saveBtn.addEventListener("click", () => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        const tab = tabs[0];

        const bookmark = {
            title: tab.title,
            url: tab.url,
            group: groupInput.value || "General"
        };

        chrome.storage.local.get("token", (data) => {

            if (!data.token) {
                alert("Please login first");
                return;
            }

            fetch("http://localhost:3000/bookmark", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: data.token
                },
                body: JSON.stringify(bookmark)
            })
            .then(res => res.json())
            .then(() => {
                loadBookmarks();
            });

        });

    });

});

/* -----------------------------
LOGIN BTN 
----------------------------- */


// if (loginBtn) {
//     loginBtn.addEventListener("click", () => {
//         fetch("http://localhost:3000/login", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 email: emailInput.value,
//                 password: passwordInput.value
//             })
//         })
//         .then(res => res.json())
//         .then(data => {
//             if (data.token) {
//                 chrome.storage.local.set({ token: data.token }, () => {

//                     if (authSection) authSection.style.display = "none";
//                     if (appSection) appSection.style.display = "block";

//                     loadBookmarks();

//                 });
//             } else {
//                 alert("Login failed");
//             }
//         });
//     });
// }


/* -----------------------------
SIGNUP BTN 
----------------------------- */

// signupBtn.addEventListener("click", () => {
//     fetch("http://localhost:3000/signup", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             email: emailInput.value,
//             password: passwordInput.value
//         })
//     })
//     .then(res => res.json())
//     .then(() => {
//         alert("Signup successful! Now login.");
//     });
// });

// saveBtn.addEventListener("click", () => {

//     chrome.tabs.query({active:true,currentWindow:true}, (tabs)=>{

//         const tab = tabs[0];

//         const bookmark = {
//             title: tab.title,
//             url: tab.url,
//             group: groupSelect.value
//         };
        
//         fetch("http://localhost:3000/bookmark",{
//             method:"POST",
//             headers:{
//                 "Content-Type":"application/json"
//             },
//             body: JSON.stringify(bookmark)
//         })
//         .then(res => res.json())
//         .then(data => {
//             loadBookmarks();
//         });
//     });

// });

/* -----------------------------
LOAD BOOKMARKS
----------------------------- */

function loadBookmarks(){

    chrome.storage.local.get("token", (data) => {

        // 🔐 If not logged in
        if (!data.token) {
            allBookmarks = [];   // clear old data
            bookmarkList.innerHTML = "<p>Please login from Account</p>";
            return;
        }

        // 📡 Fetch bookmarks from backend
        fetch("http://localhost:3000/bookmarks", {
            headers: {
                Authorization: data.token
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to fetch bookmarks");
            }
            return res.json();
        })
        .then(bookmarks => {

            // 🧠 Store globally for search
            allBookmarks = bookmarks;

            // 🖼 Render UI
            renderBookmarks(bookmarks);

        })
        .catch(err => {
            console.error("Error loading bookmarks:", err);
            bookmarkList.innerHTML = "<p>Error loading bookmarks</p>";
        });

    });

}

function renderBookmarks(bookmarks){

    bookmarkList.innerHTML = "";

    bookmarks.forEach(b => {

        const item = document.createElement("div");
        item.className = "bookmark";

        const title = document.createElement("span");
        title.textContent = b.title;

        title.onclick = () => {
            chrome.tabs.create({ url: b.url });
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteBookmark(b._id);
        };

        item.appendChild(title);
        item.appendChild(deleteBtn);

        bookmarkList.appendChild(item);

    });

}

// function loadBookmarks(){

//     chrome.storage.local.get("bookmarks", (data)=>{

//         const bookmarks = data.bookmarks || [];

//         bookmarkList.innerHTML = "";

//         bookmarks.forEach((b,index)=>{

//             const item = document.createElement("div");
//             item.className = "bookmark";

//             const favicon = document.createElement("img");
//             favicon.src = "https://www.google.com/s2/favicons?domain=" + b.url;

//             const title = document.createElement("span");
//             title.textContent = b.title;

//             const deleteBtn = document.createElement("button");
//             deleteBtn.textContent = "✕";

//             deleteBtn.onclick = (e)=>{

//                 e.stopPropagation();
//                 deleteBookmark(index);

//             };

//             item.appendChild(favicon);
//             item.appendChild(title);
//             item.appendChild(deleteBtn);

//             item.onclick = ()=>{

//                 chrome.tabs.create({url:b.url});

//             };

//             bookmarkList.appendChild(item);

//         });

//     });

// }



/* -----------------------------
DELETE BOOKMARK
----------------------------- */
function deleteBookmark(id){

    chrome.storage.local.get("token", (data) => {

        fetch("http://localhost:3000/bookmark/" + id, {
            method: "DELETE",
            headers: {
                Authorization: data.token
            }
        })
        .then(() => loadBookmarks());

    });

}
// function deleteBookmark(index){

//     chrome.storage.local.get("bookmarks", (data)=>{

//         const bookmarks = data.bookmarks || [];

//         bookmarks.splice(index,1);

//         chrome.storage.local.set({bookmarks}, ()=>{

//             loadBookmarks();

//         });

//     });

// }



/* -----------------------------
SEARCH BOOKMARKS
----------------------------- */

if (searchInput) {
    searchInput.addEventListener("input", () => {

        const query = searchInput.value.toLowerCase();

        const filtered = allBookmarks.filter(b =>
            b.title.toLowerCase().includes(query)
        );

        renderBookmarks(filtered);   // ✅ use same renderer

        console.log("ALL:", allBookmarks);

    });
}

/* -----------------------------
INITIAL LOAD
----------------------------- */

// loadBookmarks();

});
