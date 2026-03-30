// utils/api.js

export function apiFetch(url, options = {}) {
  return new Promise((resolve, reject) => {

    chrome.storage.local.get("token", (data) => {

      // 🔐 No token
      if (!data.token) {
        return reject("No token");
      }

      fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: data.token
        }
      })
      .then(res => {

        // 🔐 Auth error
        if (res.status === 401) {
          return reject("Unauthorized");
        }

        if (!res.ok) {
          return reject("Request failed");
        }

        return res.json();
      })
      .then(resolve)
      .catch(reject);

    });

  });
}