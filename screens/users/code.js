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
        <div class="name">${user.nombre || "N/A"} ${user.apellidoPa || ""} ${
      user.apellidoMa || ""
    }</div>
        <div class="role">${user.descriptionUserType || "N/A"}</div>
        <div class="status">${user.activo ? "Active" : "Inactive"}</div>
        <div class="actions">
          <div class="circle ${user.activo ? "green" : "red"}"></div>
          <div class="icon">
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>
      <div class="card-details">
        <div class="section">
          <h2 class="section-title">Date birth:</h2>
          <p>${user.fecNac ? user.fecNac.split("T")[0] : "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Gender:</h2>
          <p>${user.sexo || "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Address:</h2>
          <p>${user.dirColonia || "N/A"} ${user.dirCalle} ${user.dirNum}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Phone number:</h2>
          <p>${user.telefono || "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Email:</h2>
          <p>${user.email || "N/A"}</p>
        </div>
        <div class="section">
          <h2 class="section-title">Role:</h2>
          <p>${user.descriptionUserType || "N/A"}</p>
        </div>
        <div class="buttons-container">
          <div class="update-button" onclick="openUpdateForm(${
            user.id || user.userId || 0
          })">Update</div>
          <div class="disable-button">Disable</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Event listeners para abrir/cerrar cards
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

// Función global para abrir el formulario de actualización
window.openUpdateForm = function (userId) {
  console.log("Opening update form for user:", userId);

  // Encontrar el usuario por ID
  const userToUpdate = allUsers.find(
    (user) => (user.id || user.userId) === userId
  );

  if (userToUpdate) {
    // Llenar el formulario con los datos del usuario
    populateUpdateForm(userToUpdate);
  }

  // Mostrar el formulario de actualización
  document.getElementById("card-container").style.display = "none";
  document.getElementById("update-user-container").style.display = "flex";
};

// Función para llenar el formulario de actualización con los datos del usuario
function populateUpdateForm(user) {
  const updateContainer = document.getElementById("update-user-container");

  // Cambiar el título
  updateContainer.querySelector(".add-user-title").textContent = "Update User";
  updateContainer.querySelector(".submit-button").textContent = "Update User";

  // Llenar los campos con la información del usuario
  const nameField = updateContainer.querySelector("#name");
  const surnameField = updateContainer.querySelector("#sur-name");
  const lastnameField = updateContainer.querySelector("#last-name");
  const dateField = updateContainer.querySelector("#date-birth");
  const genderField = updateContainer.querySelector("#gender");
  const coloniaField = updateContainer.querySelector("#colonia");
  const streetField = updateContainer.querySelector("#street");
  const numberField = updateContainer.querySelector("#number");
  const phoneField = updateContainer.querySelector("#phone-number");
  const emailField = updateContainer.querySelector("#email");
  const roleField = updateContainer.querySelector("#role");

  // Llenar los campos (ajusta según la estructura de tu objeto user)
  if (nameField && user.nombre) nameField.value = user.nombre;
  if (surnameField && user.apellidoPa) surnameField.value = user.apellidoPa;
  if (lastnameField && user.apellidoMa) lastnameField.value = user.apellidoMa;
  if (dateField && user.fecNac) {
    const date = new Date(user.fecNac);
    dateField.value = date.toISOString().split("T")[0];
  }
  if (genderField && user.gender) {
    genderField.value = user.gender.toLowerCase();
  }
  if (coloniaField && user.dirColonia) coloniaField.value = user.dirColonia;
  if (streetField && user.dirCalle) streetField.value = user.dirCalle;
  if (numberField && user.dirNum) numberField.value = user.dirNum;
  if (phoneField && user.telefono) phoneField.value = user.telefono;
  if (emailField && user.email) emailField.value = user.email;
  if (roleField && user.descriptionUserType) {
    // Mapear el rol a su valor correspondiente
    const roleMapping = {
      Patient: "patient",
      Doctor: "doctor",
      Caregiver: "caregiver",
      Paciente: "patient",
      Médico: "doctor",
      Cuidador: "caregiver",
    };
    roleField.value = roleMapping[user.descriptionUserType] || "patient";
  }

  // Guardar el ID del usuario para la actualización
  updateContainer.setAttribute("data-user-id", user.id || user.userId || 0);
}

getUserData()
  .then((data) => {
    allUsers = Array.isArray(data) ? data : [data];

    const select = document.getElementById("filter-select");
    const searchInput = document.getElementById("search-input");

    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "activo";
    defaultOption.textContent = "Active";
    select.appendChild(defaultOption);

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    select.appendChild(allOption);

    const inactiveOption = document.createElement("option");
    inactiveOption.value = "inactivo";
    inactiveOption.textContent = "Inactive";
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

    // Define aquí applyFilters para que esté disponible
    function applyFilters() {
      const roleValue = select.value;
      const searchTerm = searchInput.value.toLowerCase();

      let filtered = allUsers;

      if (roleValue === "activo") {
        filtered = filtered.filter(
          (user) => user.active === true || user.activo === true
        );
      } else if (roleValue === "inactivo") {
        filtered = filtered.filter(
          (user) => user.active === false || user.activo === false
        );
      } else if (roleValue && roleValue !== "") {
        filtered = filtered.filter((user) => user.idUserType == roleValue);
      }

      if (searchTerm) {
        filtered = filtered.filter((user) =>
          (user.fullName || "").toLowerCase().includes(searchTerm)
        );
      }

      renderCardsFromArray(filtered);
    }

    // Establecer el filtro inicial a "activo"
    select.value = "activo";
    applyFilters(); // Aplicar el filtro al cargar la página

    // Event Listeners para filtros
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
  document.getElementById("update-user-container").style.display = "none";
  cardContainer.style.display = "flex";
});

// Event listener para el botón back del formulario de actualización
document
  .querySelector("#update-user-container #back-button")
  .addEventListener("click", () => {
    document.getElementById("update-user-container").style.display = "none";
    document.getElementById("card-container").style.display = "flex";
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

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

// Validar campos en tiempo real para solo letras
["name", "sur-name", "last-name"].forEach((id) => {
  document.getElementById(id).addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
  });
});

// Validar Colonia y Calle (letras, números y espacios)
["colonia", "street"].forEach((id) => {
  document.getElementById(id).addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]/g, "");
  });
});

document
  .getElementById("user-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("name").value.trim();
    const apellidoPa = document.getElementById("sur-name").value.trim();
    const apellidoMa = document.getElementById("last-name").value.trim();

    if (!nameRegex.test(nombre)) {
      showToast("Name can only contain letters.", "error");
      return;
    }
    if (!nameRegex.test(apellidoPa)) {
      showToast("Surname can only contain letters.", "error");
      return;
    }
    if (!nameRegex.test(apellidoMa)) {
      showToast("Last Name can only contain letters.", "error");
      return;
    }

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
        gender = "Male";
        break;
      case "female":
      case "femenino":
        gender = "Female";
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

// Validaciones en tiempo real (nombre, apellidos, colonia, calle)
// const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const addressRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/;

["name", "sur-name", "last-name"].forEach((id) => {
  document
    .querySelector(`#update-user-container #${id}`)
    .addEventListener("input", function () {
      this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    });
});

["colonia", "street"].forEach((id) => {
  document
    .querySelector(`#update-user-container #${id}`)
    .addEventListener("input", function () {
      this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]/g, "");
    });
});

// Teléfono solo números, máximo 10 dígitos
document
  .querySelector("#update-user-container #phone-number")
  .addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

// Submit del formulario de actualización
document
  .querySelector("#update-user-container form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const container = document.getElementById("update-user-container");
    const userId = container.getAttribute("data-user-id");

    const nombre = document
      .querySelector("#update-user-container #name")
      .value.trim();
    const apellidoPa = document
      .querySelector("#update-user-container #sur-name")
      .value.trim();
    const apellidoMa = document
      .querySelector("#update-user-container #last-name")
      .value.trim();
    const colonia = document
      .querySelector("#update-user-container #colonia")
      .value.trim();
    const calle = document
      .querySelector("#update-user-container #street")
      .value.trim();
    const telefono = document
      .querySelector("#update-user-container #phone-number")
      .value.trim();
    const email = document
      .querySelector("#update-user-container #email")
      .value.trim();
    // const contrasena = document.querySelector(
    //   "#update-user-container #password"
    // ).value;
    // const roleSelect = document.querySelector("#update-user-container #role");
    // const genderSelect = document.querySelector(
    //   "#update-user-container #gender"
    // );
    const dateBirth = document.querySelector(
      "#update-user-container #date-birth"
    ).value;

    // Validaciones
    if (!nameRegex.test(nombre))
      return showToast("Name can only contain letters.", "error");
    if (!nameRegex.test(apellidoPa))
      return showToast("Surname can only contain letters.", "error");
    if (!nameRegex.test(apellidoMa))
      return showToast("Last Name can only contain letters.", "error");
    if (!addressRegex.test(colonia))
      return showToast(
        "Colonia can only contain letters and numbers.",
        "error"
      );
    if (!addressRegex.test(calle))
      return showToast("Street can only contain letters and numbers.", "error");

    if (telefono.length < 8 || telefono.length > 15) {
      return showToast(
        "Phone number must be between 8 and 15 digits.",
        "error"
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showToast("Please enter a valid email.", "error");
    }

    // if (contrasena && contrasena.length < 6) {
    //   return showToast("Password must be at least 6 characters.", "error");
    // }

    // const roleValue = roleSelect.value;
    // let roleId = "";
    // switch (roleValue.toLowerCase()) {
    //   case "patient":
    //     roleId = "PAC";
    //     break;
    //   case "doctor":
    //     roleId = "MED";
    //     break;
    //   case "caregiver":
    //     roleId = "CUID";
    //     break;
    //   default:
    //     showToast("Invalid role selected.", "error");
    //     return;
    // }

    const genderValue = genderSelect.value;
    let gender = "";
    switch (genderValue.toLowerCase()) {
      case "male":
        gender = "Male";
        break;
      case "female":
        gender = "Female";
        break;
      default:
        showToast("Invalid gender selected.", "error");
        return;
    }

    const isoDate = new Date(dateBirth).toISOString();

    const userData = {
      id: parseInt(userId),
      nombre,
      apellidoPa,
      apellidoMa,
      fecNac: isoDate,
      sexo: gender,
      dirColonia: colonia,
      dirCalle: calle,
      dirNum: document
        .querySelector("#update-user-container #number")
        .value.trim(),
      telefono,
      email,
      // contrasena: contrasena,
      activo: true,
      // idTipoUsuario: {
      //   _id: roleId,
      //   descripcion: roleValue,
      // },
    };

    // if (contrasena) {
    //   userData.contrasena = contrasena;
    // }

    try {
      console.log(userData);
      const url = `${config.api.apiURL}/Users/updateUser`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData.message || "Failed to update user.", "error");
        return;
      }

      showToast("User updated successfully!", "success");

      // Reset view
      container.style.display = "none";
      document.getElementById("card-container").style.display = "flex";

      // Recargar usuarios
      const { getUserData } = await import("./services.js");
      const data = await getUserData();
      allUsers = Array.isArray(data) ? data : [data];
      renderCardsFromArray(allUsers);
    } catch (error) {
      console.error("Error updating user:", error);
      showToast("An unexpected error occurred.", "error");
    }
  });
