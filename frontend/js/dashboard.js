const dashboardMessage = document.getElementById("dashboard-message");
const logoutButton = document.getElementById("logout-button");

async function loadProfile() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      window.location.replace("/index.html");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    document.getElementById("profile-username").textContent =
      data.user.username;

    document.getElementById("profile-email").textContent =
      data.user.email;

    document.getElementById("profile-status").textContent =
      "Signed in";
  } catch (error) {
    dashboardMessage.textContent =
      error.message || "Could not load your profile.";
  }
}

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  dashboardMessage.textContent = "";

  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    if (response.ok || response.status === 401) {
      window.location.replace("/index.html");
      return;
    }

    const data = await response.json();
    dashboardMessage.textContent = data.message;
  } catch {
    dashboardMessage.textContent =
      "Could not reach the server. Please try again.";
  } finally {
    logoutButton.disabled = false;
  }
});

window.addEventListener("pageshow", loadProfile);