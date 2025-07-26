export function init() {
  document
    .getElementById("login-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const deviceType = isWebDevice() ? "WEB" : "MOBILE";

      console.log("Email:", email);
      console.log("Password:", password);
      console.log("Device Type:", deviceType);

      if (!email || !password) {
        showToast("Please enter email and password.", "error");
        return;
      }

      const payload = { email, password, deviceType };
      console.log("Payload to send:", payload);

      try {
        const response = await fetch(`http://localhost:5221/api/Auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Login failed:", response.statusText, errorText);
          showToast("Invalid email or password.", "error");
          return;
        }

        const userData = await response.json();
        console.log("Received user data:", userData);

        const userRole = userData.data.rol;
        const userId = userData.data.id;

        console.log("User Role:", userRole);
        console.log("User ID:", userId);

        if (
          (userRole === "MED" || userRole === "med") &&
          deviceType === "WEB"
        ) {
          localStorage.setItem("userId", userId);
          localStorage.setItem("userRole", userRole);

          location.href = "../../../index.html";
        } else {
          showToast("Access denied. Only MED role allowed on web.", "error");
        }
      } catch (error) {
        console.error("Error during login:", error);
        showToast("Unexpected error. Please try again.", "error");
      }
    });

  document
    .getElementById("togglePassword")
    .addEventListener("click", function () {
      const passwordInput = document.getElementById("password");
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
}

function isWebDevice() {
  return !/Mobi|Android/i.test(navigator.userAgent);
}

function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

init();
