const form = document.getElementById("register-form");
const message = document.getElementById("form-message");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword =
    document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    return;
  }

  if (new TextEncoder().encode(password).length > 72) {
    message.textContent = "Password must be at most 72 bytes.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Creating account…";

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    message.textContent = data.message;

    if (response.ok) {
      form.reset();
    }
  } catch (error) {
    message.textContent =
      "Could not reach the server. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create account";
  }
});