const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const submitBtn = document.getElementById("submitBtn");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");

let mode = "login";

// TAB SWITCHING
loginTab.onclick = () => {
  mode = "login";
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  submitBtn.textContent = "Login";
};

signupTab.onclick = () => {
  mode = "signup";
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  submitBtn.textContent = "Signup";
};

// SUBMIT
submitBtn.onclick = () => {
  const url = mode === "login"
    ? "http://localhost:3000/login"
    : "http://localhost:3000/signup";

  fetch(url, {
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

  // 🔐 LOGIN FLOW
  if (mode === "login") {
    if (data.token) {
      chrome.storage.local.set({ token: data.token }, () => {
        message.style.color = "green";
        message.textContent = "Login successful! Redirecting...";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      });
    } else {
      message.style.color = "red";
      message.textContent = "Login failed";
    }
  }

  // 🚀 SIGNUP → AUTO LOGIN FLOW
  else if (mode === "signup") {

    // After signup, immediately login
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
    .then(loginData => {

      if (loginData.token) {
        chrome.storage.local.set({ token: loginData.token }, () => {
          message.style.color = "green";
          message.textContent = "Signup successful! Redirecting...";

          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1000);
        });
      } else {
        message.style.color = "red";
        message.textContent = "Signup worked, but login failed";
      }

    });
  }

})
  .catch(() => {
    message.textContent = "Something went wrong";
  });
};