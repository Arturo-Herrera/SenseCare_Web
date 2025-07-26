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

    const activeOption = document.createElement("option");
    activeOption.value = "activo";
    activeOption.textContent = "Activo";
    select.appendChild(activeOption);

    const inactiveOption = document.createElement("option");
    inactiveOption.value = "inactivo";
    inactiveOption.textContent = "Inactivo";
    select.appendChild(inactiveOption);

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

      if (roleValue === "activo") {
        filtered = filtered.filter((user) => user.active === true);
      } else if (roleValue === "inactivo") {
        filtered = filtered.filter((user) => user.active === false);
      } else if (roleValue && roleValue !== "") {
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

document.getElementById("role").addEventListener("change", async function () {
  const selectedRole = this.value;

  const existingCaregiverGroup = document.getElementById("caregiver-group");
  const existingDeviceGroup = document.getElementById("device-group");
  if (existingCaregiverGroup) existingCaregiverGroup.remove();
  if (existingDeviceGroup) existingDeviceGroup.remove();

  if (selectedRole === "patient") {
    try {
      const response = await fetch(`${config.api.apiURL}/Users/caregivers`);
      if (!response.ok)
        throw new Error("Failed to fetch caregivers and devices.");
      const result = await response.json();

      const caregivers = result.data.availableCaregivers;
      const devices = result.data.availableDevices;

      const caregiverGroup = document.createElement("div");
      caregiverGroup.className = "form-group";
      caregiverGroup.id = "caregiver-group";
      caregiverGroup.innerHTML = `
        <label for="caregiver-select">Assign Caregiver</label>
        <select id="caregiver-select" required>
          <option value="" disabled selected>Select caregiver</option>
          ${caregivers
            .map(
              (c) =>
                `<option value="${c.id}">${
                  c.nombreCompleto || "Unnamed Caregiver"
                }</option>`
            )
            .join("")}
        </select>
      `;
      const roleSelect = document.getElementById("role");
      roleSelect.closest(".form-group").after(caregiverGroup);

      const deviceGroup = document.createElement("div");
      deviceGroup.className = "form-group";
      deviceGroup.id = "device-group";
      deviceGroup.innerHTML = `
        <label for="device-select">Assign Device</label>
        <select id="device-select" required>
          <option value="" disabled selected>Select device</option>
          ${devices
            .map((d) => `<option value="${d.id}">Device #${d.id}</option>`)
            .join("")}
        </select>
      `;
      caregiverGroup.after(deviceGroup);
    } catch (error) {
      console.error("Error loading caregivers/devices:", error);
      showToast("Failed to load caregivers or devices.", "error");
    }
  }
});

document
  .getElementById("user-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const rawDate = document.getElementById("date-birth").value;
    const [day, month, year] = rawDate.includes("-")
      ? rawDate.split("-").reverse()
      : rawDate.split("/");
    const isoDate = new Date(`${year}-${month}-${day}T00:00:00`).toISOString();

    const roleSelect = document.getElementById("role");
    const selectedRole = roleSelect.value;
    const selectedRoleText = roleSelect.options[roleSelect.selectedIndex].text;
    const genderSelect = document.getElementById("gender");
    const selectedGender =
      genderSelect.options[genderSelect.selectedIndex].text;

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

    if (roleId === "PAC") {
      const caregiverSelect = document.getElementById("caregiver-select");
      const deviceSelect = document.getElementById("device-select");

      if (!caregiverSelect || !caregiverSelect.value) {
        showToast("Please select a caregiver.", "error");
        return;
      }

      if (!deviceSelect || !deviceSelect.value) {
        showToast("Please select a device.", "error");
        return;
      }

      userData.idCuidador = parseInt(caregiverSelect.value);
      userData.idDispositivo = parseInt(deviceSelect.value);
    }

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
      const url =
        roleId === "PAC"
          ? `${config.api.apiURL}/Patient/register`
          : `${config.api.apiURL}/Users`;

      const response = await fetch(url, {
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
      this.reset();

      const caregiverGroup = document.getElementById("caregiver-group");
      const deviceGroup = document.getElementById("device-group");

      if (caregiverGroup) caregiverGroup.remove();
      if (deviceGroup) deviceGroup.remove();

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

  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase().trim();
  searchResults.innerHTML = "";

  if (term === "") return;

  const matches = patients.filter(p =>
    p.fullName.toLowerCase().includes(term)
  );

  matches.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.fullName;
    li.addEventListener("click", () => {
      searchInput.value = p.fullName;
      searchResults.innerHTML = "";
      // acción al seleccionar paciente
    });
    searchResults.appendChild(li);
  });
});
