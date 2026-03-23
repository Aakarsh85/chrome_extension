fetch("http://localhost:3000/bookmarks")
.then(res => res.json())
.then(data => {

const container = document.getElementById("bookmarks");

data.forEach(b => {

const div = document.createElement("div");

div.innerHTML = `
<a href="${b.url}" target="_blank">${b.title}</a>
<p>${b.group}</p>
`;

container.appendChild(div);

});

});