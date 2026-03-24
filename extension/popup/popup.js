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

const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");



/* -----------------------------
LOGIN CHECK 
----------------------------- */

chrome.storage.local.get("token", (data) => {
    if (data.token) {
        authSection.style.display = "none";
        appSection.style.display = "block";
        loadBookmarks();
    }
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

    chrome.tabs.query({active:true,currentWindow:true}, (tabs)=>{

        const tab = tabs[0];

        const bookmark = {
            title: tab.title,
            url: tab.url,
            group: groupInput.value || "General"
        };
        
        fetch("http://localhost:3000/bookmark",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(bookmark)
        })
        .then(res => res.json())
        .then(data => {
            loadBookmarks();
        });

    });

});

/* -----------------------------
LOGIN BTN 
----------------------------- */


loginBtn.addEventListener("click", () => {
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            chrome.storage.local.set({ token: data.token }, () => {
                authSection.style.display = "none";
                appSection.style.display = "block";
                loadBookmarks();
            });
        } else {
            alert("Login failed");
        }
    });
});

/* -----------------------------
SIGNUP BTN 
----------------------------- */

signupBtn.addEventListener("click", () => {
    fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value
        })
    })
    .then(res => res.json())
    .then(() => {
        alert("Signup successful! Now login.");
    });
});

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
    
    fetch("http://localhost:3000/bookmarks")
    .then(res => res.json())
    .then(bookmarks => {

        bookmarkList.innerHTML="";

        bookmarks.forEach(b => {

            const item = document.createElement("div");
            item.className = "bookmark";

            const title = document.createElement("span");
            title.textContent = b.title;

            title.onclick = () => {
                chrome.tabs.create({url: b.url});
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";

            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // VERY IMPORTANT
                deleteBookmark(b._id);
            };

            item.appendChild(title);
            item.appendChild(deleteBtn);

            bookmarkList.appendChild(item);
        
        });
    
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
    
    fetch("http://localhost:3000/bookmark/"+id,{

        method:"DELETE"
    
    })
    .then(()=>loadBookmarks());

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

});
