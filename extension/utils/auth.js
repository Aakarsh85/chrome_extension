// utils/auth.js

export function logout() {
  chrome.storage.local.remove("token", () => {
    window.location.href = "account.html";
  });
}

export function handleAuthError(container, clearState) {
  chrome.storage.local.remove("token", () => {

    // optional state cleanup from caller
    if (clearState) clearState();

    // optional UI message
    if (container) {
      container.innerHTML = "<p>Session expired. Redirecting...</p>";
    }

    // redirect
    setTimeout(() => {
      window.location.href = "account.html";
    }, 1000);
  });
}