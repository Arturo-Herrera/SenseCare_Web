import { getUserData } from "./services.js";
import { config } from "../../../js/config.js";

let allUsers = [];

function renderCardsFromArray(users) {
  const container = document.getElementById("card-container");
  container.innerHTML = "";

  users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-summary">
        <div class="name">${user.fullName || "N/A"}</div>
        <div class="role">${user.descriptionUserType || "N/A"}</div>
        <div class="status">${user.active ? "Active" : "Inactive"}</div>
        <div class="actions">
          <div class="circle ${user.active ? "green" : "red"}"></div>
          <div class="icon">
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>
      <div class="card-details">
        <div class="section">
          <h2 class="section-title">Date birth:</h2>
          <p>${user.birthDate ? user.birthDate.split("T")[0] : "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Gender:</h2>
          <p>${user.gender || "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Address:</h2>
          <p>${user.fullAddress || "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Phone number:</h2>
          <p>${user.phoneNumber || "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Email:</h2>
          <p>${user.email || "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Role:</h2>
          <p>${user.descriptionUserType || "N/A"}</p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".icon i").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      const details = card.querySelector(".card-details");
      const isOpen = card.classList.contains("open");

      if (isOpen) {
        details.style.height = details.scrollHeight + "px";
        requestAnimationFrame(() => {
          details.style.height = "0";
        });
        card.classList.remove("open");
        e.target.classList.remove("open");
      } else {
        details.style.height = details.scrollHeight + "px";
        card.classList.add("open");
        e.target.classList.add("open");

        details.addEventListener("transitionend", function resetHeight() {
          if (card.classList.contains("open")) {
            details.style.height = "auto";
          }
          details.removeEventListener("transitionend", resetHeight);
        });
      }
    });
  });
}

getUserData()
  .then((data) => {
    allUsers = Array.isArray(data) ? data : [data];

    const select = document.getElementById("filter-select");
    const searchInput = document.getElementById("search-input");

    select.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "All";
    select.appendChild(defaultOption);

    const tiposUnicos = [];
    const idsAgregados = new Set();

    allUsers.forEach((user) => {
      if (!idsAgregados.has(user.idUserType)) {
        tiposUnicos.push({
          id: user.idUserType,
          descripcion: user.descriptionUserType,
        });
        idsAgregados.add(user.idUserType);
      }
    });

    tiposUnicos.forEach((tipo) => {
      const option = document.createElement("option");
      option.value = tipo.id;
      option.textContent = tipo.descripcion || "N/A";
      select.appendChild(option);
    });

    renderCardsFromArray(allUsers);

    function applyFilters() {
      const roleValue = select.value;
      const searchTerm = searchInput.value.toLowerCase();

      let filtered = allUsers;

      if (roleValue) {
        filtered = filtered.filter((user) => user.idUserType == roleValue);
      }

      if (searchTerm) {
        filtered = filtered.filter((user) =>
          user.fullName.toLowerCase().includes(searchTerm)
        );
      }

      renderCardsFromArray(filtered);
    }

    select.addEventListener("change", applyFilters);
    searchInput.addEventListener("input", applyFilters);
  })
  .catch((error) => {
    console.error("Error fetching user data:", error);
  });

const addButton = document.querySelector(".add-button");
const cardContainer = document.getElementById("card-container");
const createUserContainer = document.getElementById("create-user-container");
const backButton = document.getElementById("back-button");

addButton.addEventListener("click", () => {
  cardContainer.style.display = "none";
  createUserContainer.style.display = "flex";
});

backButton.addEventListener("click", () => {
  createUserContainer.style.display = "none";
  cardContainer.style.display = "flex";
});

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

const userForm = document.getElementById("user-form");

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const rawDate = document.getElementById("date-birth").value;
  const [day, month, year] = rawDate.includes("-")
    ? rawDate.split("-").reverse()
    : rawDate.split("/");

  const isoDate = new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();

  const roleSelect = document.getElementById("role");
  const selectedRoleText = roleSelect.options[roleSelect.selectedIndex].text;
  const genderSelect = document.getElementById("gender");
  const selectedGender = genderSelect.options[genderSelect.selectedIndex].text;

  let roleId = "";
  switch (selectedRoleText.toLowerCase()) {
    case "patient":
    case "paciente":
      roleId = "PAC";
      break;
    case "doctor":
    case "médico":
      roleId = "MED";
      break;
    case "caregiver":
    case "cuidador":
      roleId = "CUID";
      break;
    default:
      showToast("Invalid role selected.", "error");
      return;
  }

  let gender = "";
  switch (selectedGender.toLowerCase()) {
    case "male":
    case "masculino":
      gender = "Masculino";
      break;
    case "female":
    case "femenino":
      gender = "Femenino";
      break;
    default:
      showToast("Invalid gender selected.", "error");
      return;
  }

  const userData = {
    id: 0,
    nombre: document.getElementById("name").value.trim(),
    apellidoPa: document.getElementById("sur-name").value.trim(),
    apellidoMa: document.getElementById("last-name").value.trim(),
    fecNac: isoDate,
    sexo: gender,
    dirColonia: document.getElementById("colonia").value.trim(),
    dirCalle: document.getElementById("street").value.trim(),
    dirNum: document.getElementById("number").value.trim(),
    telefono: document.getElementById("phone-number").value.trim(),
    email: document.getElementById("email").value.trim(),
    contrasena: document.getElementById("password").value,
    activo: true,
    idTipoUsuario: {
      _id: roleId,
      descripcion: selectedRoleText,
    },
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    showToast("Please enter a valid email.", "error");
    return;
  }

  if (userData.contrasena.length < 6) {
    showToast("Password must be at least 6 characters.", "error");
    return;
  }

  if (userData.telefono.length < 8 || userData.telefono.length > 15) {
    showToast("Phone number must be between 8 and 15 digits.", "error");
    return;
  }

  try {
    const response = await fetch(`${config.api.apiURL}/Users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showToast(errorData.message || "Failed to create user.", "error");
      return;
    }

    showToast("User created successfully!", "success");
    userForm.reset();

    document.getElementById("create-user-container").style.display = "none";
    document.getElementById("card-container").style.display = "flex";

    const { getUserData } = await import("./services.js");
    const data = await getUserData();
    allUsers = Array.isArray(data) ? data : [data];
    renderCardsFromArray(allUsers);
  } catch (error) {
    console.error("Error submitting form:", error);
    showToast("An unexpected error occurred.", "error");
  }
});
