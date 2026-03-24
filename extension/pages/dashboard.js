const container = document.getElementById("bookmarkContainer");
const search = document.getElementById("search");
const groupFilter = document.getElementById("groupFilter");

let allBookmarks = [];

function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");
}

function loadBookmarks() {
  fetch("http://localhost:3000/bookmarks")
    .then(res => res.json())
    .then(data => {
      allBookmarks = data;
      renderBookmarks(data);
      populateGroups(data);
    });
}

function renderBookmarks(bookmarks) {
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

    // URL (new)
    const url = document.createElement("small");
    url.textContent = b.url;
    url.style.display = "block";
    url.style.color = "gray";

    // Actions
    const actions = document.createElement("div");
    actions.className = "actions";

    // ✏️ EDIT BUTTON
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    editBtn.onclick = () => {
      const newTitle = prompt("Edit title:", b.title);
      if (!newTitle) return;

      fetch(`http://localhost:3000/bookmark/${b._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newTitle })
      }).then(loadBookmarks);
    };

    // 🗑 DELETE BUTTON
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";


    delBtn.onclick = () => {
      fetch(`http://localhost:3000/bookmark/${b._id}`, {
        method: "DELETE"
      }).then(loadBookmarks);
    };

    // Append buttons
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    // Append everything
    card.appendChild(title);
    card.appendChild(url);
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

search.addEventListener("input", () => {
  filter();
});

groupFilter.addEventListener("change", () => {
  filter();
});

function filter() {
  const query = search.value.toLowerCase();
  const group = groupFilter.value;

  const filtered = allBookmarks.filter(b => {
    return (
      b.title.toLowerCase().includes(query) &&
      (group === "all" || b.group === group)
    );
  });

  renderBookmarks(filtered);
}

loadBookmarks();