const loginForm = document.querySelector("form");
const loginButton = loginForm.querySelector('button[type="submit"]');

let loginMessage = document.getElementById("form-message");

if (!loginMessage) {
  loginMessage = document.createElement("p");
  loginMessage.id = "form-message";
  loginMessage.className = "form-message";
  loginMessage.setAttribute("role", "status");
  loginButton.before(loginMessage);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";

  const emailInput = loginForm.querySelector('input[type="email"]');
  const passwordInput = loginForm.querySelector(
    'input[name="password"], #password'
  );

  if (!emailInput || !passwordInput) {
    loginMessage.textContent = "Login form inputs could not be found.";
    return;
  }

  const originalText = loginButton.textContent;
  loginButton.disabled = true;
  loginButton.textContent = "Signing in…";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(
        response.status === 404
          ? "Login endpoint not found. Check authRoutes.js and restart the backend."
          : `Server returned an unexpected response (${response.status}).`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent = data.message || "Sign in failed.";
      return;
    }

    window.location.replace("/dashboard.html");
  } catch (error) {
    console.error("Login error:", error);
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = originalText;
  }
});