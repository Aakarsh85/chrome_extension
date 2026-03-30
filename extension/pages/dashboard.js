import { API_URL } from "../utils/config.js";
import { apiFetch } from "../utils/api.js";
import { logout, handleAuthError } from "../utils/auth.js";

const container = document.getElementById("bookmarkContainer");
const search = document.getElementById("search");
const tagSearch = document.getElementById("tagSearch");
const groupFilter = document.getElementById("groupFilter");
const logoutBtn = document.getElementById("logoutBtn");


let allBookmarks = [];

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

if (tagSearch) {
  tagSearch.addEventListener("input", filter);
}

// function apiFetch(url, options = {}) {
//   return new Promise((resolve, reject) => {

//     chrome.storage.local.get("token", (data) => {

//       // 🔐 No token
//       if (!data.token) {
//         handleAuthError();
//         return reject("No token");
//       }

//       fetch(url, {
//         ...options,
//         headers: {
//           ...(options.headers || {}),
//           Authorization: data.token
//         }
//       })
//       .then(res => {

//         // 🔐 Handle auth error globally
//         if (res.status === 401) {
//           handleAuthError();
//           return reject("Unauthorized");
//         }

//         if (!res.ok) {
//           return reject("Request failed");
//         }

//         return res.json();
//       })
//       .then(resolve)
//       .catch(reject);

//     });

//   });
// }


function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");
}


// function logout() {
//   if (!confirm("Are you sure you want to logout?")) return;

//   chrome.storage.local.remove("token", () => {

//     // 🧹 Clear app state
//     allBookmarks = [];

//     // 🖥 Clear UI
//     if (container) {
//       container.innerHTML = "<p>Logged out</p>";
//     }

//     // 🔄 Redirect immediately (no need to delay)
//     window.location.href = "account.html";

//   });
// }

// function handleAuthError() {
//   chrome.storage.local.remove("token", () => {
//     allBookmarks = [];

//     if (container) {
//       container.innerHTML = "<p>Session expired. Redirecting...</p>";
//     }

//     setTimeout(() => {
//       window.location.href = "account.html";
//     }, 1000);
//   });
// }
// function handleAuthError() {
//   chrome.storage.local.remove("token", () => {
//     allBookmarks = [];
//     container.innerHTML = "<p>Session expired. Please login again.</p>";

//     setTimeout(() => {
//       window.location.href = "account.html";
//     }, 1000);
//   });
// }

function loadBookmarks() {

  apiFetch(`${API_URL}/bookmarks`)
    .then(bookmarks => {

      if (!Array.isArray(bookmarks)) {
        throw new Error("Invalid data");
      }

      allBookmarks = bookmarks;
      renderBookmarks(bookmarks);
      populateGroups(bookmarks);

    })
    .catch(err => {

      console.error("Error:", err);

      // 🔥 Handle auth errors
      if (err === "Unauthorized" || err === "No token") {
        handleAuthError(container, () => {
          allBookmarks = [];
        });
        return;
      }

      // Other errors
      allBookmarks = [];
      container.innerHTML = "<p>Error loading bookmarks</p>";

    });

}

// function loadBookmarks() {
//   chrome.storage.local.get("token", (data) => {

//     // 🔐 STEP 1: Check if token exists
//     if (!data.token) {
//       allBookmarks = [];
//       container.innerHTML = "<p>Please login first</p>";
//       return;
//     }

//     // 📡 STEP 2: Fetch bookmarks with token
//     fetch("http://localhost:3000/bookmarks", {
//       headers: {
//         Authorization: data.token
//       }
//     })
//     .then(res => {

//       // 🔐 STEP 3: Handle unauthorized
//       if (res.status === 401) {
//         handleAuthError();
//         return;
//       }
      
//       if (!res.ok) {
//         throw new Error("Failed to fetch");
//       }

//       return res.json();
//     })
//     .then(bookmarks => {

//       // 🧠 STEP 4: Store + render
//       if (!Array.isArray(bookmarks)) {
//         throw new Error("Invalid data");
//       }
//       allBookmarks = bookmarks;
//       renderBookmarks(bookmarks);
//       populateGroups(bookmarks);

//     })
//     .catch(err => {

//       console.error("Error:", err);

//       // 🧹 STEP 5: Clean UI on error
//       allBookmarks = [];
//       container.innerHTML = "<p>Please login again</p>";

//     });

//   });
// }

function renderBookmarks(bookmarks) {

  if (bookmarks.length === 0) {
    container.innerHTML = "<p>No bookmarks yet</p>";
    return;
  }
  container.innerHTML = "";

  bookmarks.forEach(b => {

    const card = document.createElement("div");
    card.className = "bookmark-card";

    // Title
    const title = document.createElement("span");
    title.textContent = b.title;

    title.onclick = () => {
      window.open(b.url, "_blank");
    };

    // URL
    const url = document.createElement("small");
    url.textContent = b.url;
    url.style.display = "block";
    url.style.color = "gray";

    //For displaying tags
    const tags = document.createElement("div");
    tags.className = "tags";
    
    tags.textContent = (b.tags && b.tags.length > 0)
      ? "Tags: " + b.tags.join(", ")
      : "";
  
    // Actions
    const actions = document.createElement("div");
    actions.className = "actions";

    // ✏️ EDIT BUTTON
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    editBtn.onclick = () => {
      const newTitle = prompt("Edit title:", b.title);
      if (!newTitle || !newTitle.trim()) return;

      apiFetch(`${API_URL}/bookmark/${b._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newTitle })
      })
      .then(() => loadBookmarks())
      .catch(err => {

        if (err === "Unauthorized" || err === "No token") {
          handleAuthError(container, () => {
            allBookmarks = [];
          });
          return;
        }

        alert("Failed to update bookmark");
      });
    };

    // editBtn.onclick = () => {
    //   const newTitle = prompt("Edit title:", b.title);
    //   if (!newTitle || !newTitle.trim()) return;
    //   chrome.storage.local.get("token", (data) => {
    //     if (!data.token) {
    //       alert("Please login again");
    //       return;
    //     }

    //     fetch(`http://localhost:3000/bookmark/${b._id}`, {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: data.token
    //       },
    //       body: JSON.stringify({ title: newTitle })
    //     })
    //     .then(res => {
    //       if (res.status === 401) {
    //         handleAuthError();
    //         return;
    //       }

    //       if (!res.ok) {
    //         throw new Error("Edit failed");
    //       }
          
    //       return res.json();
    //     })
    //     .then(() => loadBookmarks())
    //     .catch(() => alert("Failed to update bookmark"));
    //   });
    // }


    // 🗑 DELETE BUTTON
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";

    delBtn.onclick = () => {

      apiFetch(`${API_URL}/bookmark/${b._id}`, {
        method: "DELETE"
      })
      .then(() => loadBookmarks())
      .catch(err => {

        if (err === "Unauthorized" || err === "No token") {
          handleAuthError(container, () => {
            allBookmarks = [];
          });
          return;
        }

        alert("Failed to delete bookmark");
      });
    };

    // delBtn.onclick = () => {
    //   chrome.storage.local.get("token", (data) => {

    //     if (!data.token) {
    //       alert("Please login again");
    //       return;
    //     }

    //     fetch(`http://localhost:3000/bookmark/${b._id}`, {
    //       method: "DELETE",
    //       headers: {
    //         Authorization: data.token
    //       }
    //     })
    //     .then(res => {
    //       if (res.status === 401) {
    //         handleAuthError();
    //         return;
    //       }

    //       if (!res.ok) {
    //         throw new Error("Delete failed");
    //       }
    //     })
    //     .then(() => loadBookmarks())
    //     .catch(() => alert("Failed to delete bookmark"));
    //   });
    // }

    // Append buttons
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    // Append everything
    card.appendChild(title);
    card.appendChild(url);
    card.appendChild(tags);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

function populateGroups(bookmarks) {
  const groups = [...new Set(bookmarks.map(b => b.group))];

  groupFilter.innerHTML = `<option value="all">All Groups</option>`;

  groups.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    groupFilter.appendChild(option);
  });
}

// search.addEventListener("input", () => {
//   filter();
// });

// groupFilter.addEventListener("change", () => {
//   filter();
// });

if (search) {
  search.addEventListener("input", filter);
}

if (groupFilter) {
  groupFilter.addEventListener("change", filter);
}

function filter() {
  const query = search.value.toLowerCase();
  const group = groupFilter.value;
  const tagQuery = tagSearch.value.toLowerCase();

  const filtered = allBookmarks.filter(b => {

    const matchesTitle = b.title.toLowerCase().includes(query);

    const matchesGroup =
      (group === "all" || b.group === group);

    const matchesTags =
      !tagQuery ||
      (b.tags && b.tags.some(tag =>
        tag.toLowerCase().includes(tagQuery)
      ));

    return matchesTitle && matchesGroup && matchesTags;
  });

  renderBookmarks(filtered);
}
// Previous filter(without tags)
// function filter() {
//   const query = search.value.toLowerCase();
//   const group = groupFilter.value;

//   const filtered = allBookmarks.filter(b => {
//     return (
//       b.title.toLowerCase().includes(query) &&
//       (group === "all" || b.group === group)
//     );
//   });

//   renderBookmarks(filtered);
// }

loadBookmarks();