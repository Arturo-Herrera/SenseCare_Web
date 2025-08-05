import { getPatientData, selectPatient } from "./services.js";
import { config } from "../../../js/config.js";
// Variable global para almacenar todos los pacientes
let allPatients = [];
let currentPatientData = {};
let selectedPatientData = null;

async function initializePatientSearch() {
  try {
    console.log("Iniciando carga de pacientes...");
    const response = await selectPatient();

    if (Array.isArray(response)) {
      allPatients = response;
    } else if (response && Array.isArray(response.data)) {
      allPatients = response.data;
    } else if (response && Array.isArray(response.patients)) {
      allPatients = response.patients;
    } else {
      console.error("Estructura de respuesta no reconocida:", response);
      return;
    }

    console.log("Pacientes cargados:", allPatients);

    // Preparar nombres completos e IDs
    if (allPatients.length > 0) {
      allPatients = allPatients.map((patient) => {
        if (!patient.fullName && (patient.nombre || patient.name)) {
          patient.fullName = `${patient.nombre || patient.name || ""} ${
            patient.apellidoPa || patient.apellido || ""
          } ${patient.apellidoMa || ""}`.trim();
        }
        if (!patient.id && patient.idPaciente) {
          patient.id = patient.idPaciente;
        }
        return patient;
      });

      // Aquí mostramos el primer paciente en los campos
      const input = document.getElementById("search-patient");
      const results = document.getElementById("search-results");
      selectPatientAndRender(allPatients[0], input, results);
    }

    setupSearchListeners();
  } catch (error) {
    showToast("Error al cargar pacientes:", error);
  }
}

// Función para mostrar los primeros 10 pacientes en la lista sin filtro (para focus)
function showAllPatients() {
  const input = document.getElementById("search-patient");
  const results = document.getElementById("search-results");

  results.innerHTML = "";

  const limitedPatients = allPatients.slice(0, 10);

  limitedPatients.forEach((patient) => {
    const li = document.createElement("li");
    li.className = "search-result-item";
    li.textContent = patient.fullName.trim();

    li.addEventListener("click", () => {
      console.log("Paciente seleccionado por clic:", patient);
      selectPatientAndRender(patient, input, results);
    });

    results.appendChild(li);
  });

  if (limitedPatients.length === 0) {
    const li = document.createElement("li");
    li.className = "no-results";
    li.textContent = "No se encontraron pacientes";
    li.style.color = "#666";
    li.style.fontStyle = "italic";
    results.appendChild(li);
  }
}

// Configurar los event listeners del buscador
function setupSearchListeners() {
  const input = document.getElementById("search-patient");
  const results = document.getElementById("search-results");

  if (!input || !results) {
    showToast("No se encontraron los elementos del buscador");
    return;
  }

  console.log("Configurando listeners del buscador...");

  // Limpiar listeners anteriores
  input.replaceWith(input.cloneNode(true));
  const newInput = document.getElementById("search-patient");

  // Mostrar resultados mientras se escribe
  newInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    results.innerHTML = "";

    console.log("Buscando:", query);

    if (!query) return;

    // Filtrar pacientes que coincidan con la búsqueda
    const matches = allPatients.filter((patient) => {
      const fullName = patient.fullName || "";

      return fullName.toLowerCase().includes(query);
    });

    console.log("Coincidencias encontradas:", matches.length);

    // Limitar resultados a 10 para mejor performance
    const limitedMatches = matches.slice(0, 10);

    limitedMatches.forEach((patient) => {
      const li = document.createElement("li");
      li.className = "search-result-item";
      li.textContent = patient.fullName.trim();

      li.addEventListener("click", () => {
        console.log("Paciente seleccionado por clic:", patient);
        selectPatientAndRender(patient, newInput, results);
      });

      results.appendChild(li);
    });

    if (matches.length === 0) {
      const li = document.createElement("li");
      li.className = "no-results";
      li.textContent = "No se encontraron pacientes";
      li.style.color = "#666";
      li.style.fontStyle = "italic";
      results.appendChild(li);
    }
  });

  // Mostrar lista de pacientes al hacer focus en el input
  newInput.addEventListener("focus", () => {
    showAllPatients();
  });

  // Seleccionar con Enter
  newInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const query = e.target.value.toLowerCase().trim();
      console.log("Enter presionado, buscando:", query);

      if (!query) return;

      const exactMatch = allPatients.find(
        (patient) => (patient.fullName || "").toLowerCase() === query
      );

      const partialMatch = allPatients.find((patient) => {
        const fullName = patient.fullName || "";
        const nombre = patient.nombre || "";
        return (
          fullName.toLowerCase().includes(query) ||
          nombre.toLowerCase().includes(query)
        );
      });

      const match = exactMatch || partialMatch;

      if (match) {
        console.log("Paciente encontrado:", match);
        selectPatientAndRender(match, newInput, results);
      } else {
        showToast("No se encontró paciente con ese nombre");
        results.innerHTML =
          '<li style="color: red;">No se encontró paciente con ese nombre</li>';
        setTimeout(() => {
          results.innerHTML = "";
        }, 2000);
      }
    }
  });

  // Cerrar resultados al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!results.contains(e.target) && e.target !== newInput) {
      results.innerHTML = "";
    }
  });
}

// Función para seleccionar paciente y renderizar información
function selectPatientAndRender(patient, input, results) {
  input.value =
    patient.fullName ||
    `${patient.nombre || ""} ${patient.apellidoPa || ""}`.trim();
  results.innerHTML = "";

  const patientId = patient.id || patient.idPaciente;

  if (patientId) {
    console.log("Renderizando datos del paciente ID:", patientId);
    renderPatientData(patientId);
  } else {
    showToast("No se encontró ID del paciente:", patient);
  }
}

// Inicializar el buscador cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado, inicializando buscador...");
  initializePatientSearch();
});

// Nueva función para cargar dispositivos
async function loadAvailableDevices() {
  try {
    const response = await fetch(`${config.api.apiURL}/Users/caregivers`);
    if (!response.ok)
      throw new Error("Failed to fetch caregivers and devices.");
    const result = await response.json();
    console.log(result);

    const devices = result.data.availableDevices;
    const deviceSelect = document.getElementById("device-select");

    // Limpiar opciones anteriores excepto el placeholder
    deviceSelect.innerHTML = `<option value="" disabled selected>Select a device</option>`;

    devices.forEach((d) => {
      const option = document.createElement("option");
      option.value = d.id;
      option.textContent = `Device #${d.id}`;
      deviceSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando dispositivos:", err);
  }
}

async function loadAvailableDevicesUp() {
  try {
    const response = await fetch(`${config.api.apiURL}/Users/caregivers`);
    if (!response.ok)
      throw new Error("Failed to fetch caregivers and devices.");
    const result = await response.json();
    console.log(result);

    const devices = result.data.availableDevices;
    const deviceSelect = document.getElementById("update-device-select");

    deviceSelect.innerHTML = `<option value="" disabled selected>Select a device</option>`;

    devices.forEach((d) => {
      const option = document.createElement("option");
      option.value = d.id;
      option.textContent = `Device #${d.id}`;
      deviceSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando dispositivos:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializePatientSearch,
    loadAvailableDevices
  );
} else {
  initializePatientSearch();
}

function renderPatientData(idPatient) {
  console.log("Obteniendo datos del paciente:", idPatient);

  getPatientData(idPatient)
    .then((data) => {
      console.log("Datos recibidos:", data);

      if (data.patient && data.patient.length > 0) {
        const patientData = data.patient[0].paciente;
        renderInfoPatient(patientData, data);
        updateDashboard(data);

        currentPatientData = data;

        // SIEMPRE llamar a renderLectures, con datos o array vacío
        renderLectures(data.lectures || []);
        console.log("Lecturas recibidas:", data.lectures);

        if (data.alerts && data.alerts.length > 0) {
          renderAlerts(data.alerts);
        }
      } else {
        showToast("No patient data found");
        // También limpiar cuando no hay datos del paciente
        renderLectures([]);
      }
    })
    .catch((error) => {
      console.error("Error fetching patient data:", error);
      // Limpiar también en caso de error
      renderLectures([]);
    });
}

function renderInfoPatient(data, patient) {
  console.log("Datos del paciente:", data);

  const fullName = `${data.nombre || ""} ${data.apellidoPa || ""} ${
    data.apellidoMa || ""
  }`.trim();
  document.getElementById("name").textContent =
    fullName || "Usuario desconocido";

  document.getElementById("gender").textContent =
    data.sexo || "No especificado";

  if (data.fecNac) {
    const birthDate = new Date(data.fecNac);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    document.getElementById("age").textContent = `${age} years old`;
  } else {
    document.getElementById("age").textContent = "Edad no disponible";
  }

  const lectureElement = document.getElementById("lecture");
  if (lectureElement) {
    lectureElement.style.display = "none";
  }

  const patientModal = document.getElementById("patient-info");

  patientModal.addEventListener("click", () => {
    openInfoModal(patient);
  });
}

function renderLectures(lectures) {
  const recentLectures = lectures.slice(0, 3);
  const lectureCards = document.querySelectorAll(".lecture-card");

  // Limpiar todas las tarjetas primero
  lectureCards.forEach((card) => {
    const stats = card.querySelectorAll(".stat p");
    if (stats[0]) stats[0].textContent = "0 BPM";
    if (stats[1]) stats[1].textContent = "0 °C";
    if (stats[2]) stats[2].textContent = "0 %";
  });

  // Actualizar solo las tarjetas con datos disponibles
  recentLectures.forEach((lecture, index) => {
    if (lectureCards[index]) {
      const card = lectureCards[index];
      const stats = card.querySelectorAll(".stat p");

      if (stats[0]) {
        const pulsoArray = lecture.pulso || [];
        const pulso =
          pulsoArray.length > 0 ? pulsoArray[pulsoArray.length - 1] : 0;
        stats[0].textContent = `${pulso} BPM`;
      }

      if (stats[1]) {
        const temperatura = lecture.temperatura || 0;
        stats[1].textContent = `${temperatura} °C`;
      }

      if (stats[2]) {
        const oxigeno = lecture.oxigeno || 0;
        stats[2].textContent = `${oxigeno} %`;
      }
    }
  });

  if (lectures.length > 0) {
    console.log("Última lectura disponible pero no se muestra en el perfil");
  }
}

function renderAlerts(alerts) {
  const alertsContainer = document.querySelector(".cards-alerts-container");
  if (!alertsContainer) return;

  alertsContainer.innerHTML = "";

  const recentAlerts = alerts.slice(0, 6);

  recentAlerts.forEach((alert) => {
    const alertCard = document.createElement("div");
    alertCard.className = "card card-warning";

    alertCard.innerHTML = `
            <div class="description-alert">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p class="description">${alert.signoAfectado}</p>
            </div>
            <div class="time-alert">
                <p class="time-ago">${formatTimeAgo(alert.timeAgo)}</p>
            </div>
        `;

    alertsContainer.appendChild(alertCard);
  });
}

function formatTimeAgo(minutes) {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }
}
function updateDashboard(data) {
  currentPatientData = data;
  const vitals = data.averageVitals
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const categories = vitals.map(
    (v) => new Date(v.date).toISOString().split("T")[0]
  );
  const tempData = vitals.map((v) => v.averageTemperature);
  const bpmData = vitals.map((v) => v.averagePulse);
  const oxygenData = vitals.map((v) => v.averageOxygen);

  renderVitalChart(
    "bpm-chart-container",
    "BPM",
    bpmData,
    "#90ee90",
    categories
  );
  renderVitalChart(
    "temp-chart-container",
    "Temperature (°C)",
    tempData,
    "#ffb6c1",
    categories
  );
  renderVitalChart(
    "oxygen-chart-container",
    "Oxygen (%)",
    oxygenData,
    "#9EB3FD",
    categories
  );
}

function renderVitalChart(containerId, title, data, color, categories) {
  let plotBand = null;
  let yAxisConfig = {
    title: { text: "" },
    gridLineColor: "#f5f5f5",
  };

  if (title === "BPM") {
    plotBand = {
      from: 60,
      to: 100,
      color: "rgba(144, 238, 144, 0.2)",
      label: {
        text: "",
        style: { color: "#606060", fontSize: "10px" },
      },
    };
    yAxisConfig.min = 50;
    yAxisConfig.max = 100;
    yAxisConfig.tickInterval = 10;
  } else if (title === "Temperature (°C)") {
    plotBand = {
      from: 36.1,
      to: 37.2,
      color: "rgba(255, 182, 193, 0.2)",
      label: {
        text: "",
        style: { color: "#606060", fontSize: "10px" },
      },
    };
    yAxisConfig.min = 35;
    yAxisConfig.max = 39;
    yAxisConfig.tickInterval = 1;
  } else if (title === "Oxygen (%)") {
    plotBand = {
      from: 95,
      to: 100,
      color: "rgba(158, 179, 253, 0.2)",
      label: {
        text: "",
        style: { color: "#606060", fontSize: "10px" },
      },
    };
    yAxisConfig.min = 90;
    yAxisConfig.max = 100;
    yAxisConfig.tickInterval = 2;
  }

  if (plotBand) {
    yAxisConfig.plotBands = [plotBand];
  }

  Highcharts.chart(containerId, {
    chart: { type: "spline", backgroundColor: "transparent" },
    title: { text: title, style: { fontSize: "1.2rem", color: "#44749D" } },
    xAxis: {
      categories: categories,
      lineColor: "#ccc",
      tickColor: "#ccc",
      labels: {
        style: { fontSize: "10px", color: "#666" },
        rotation: -45,
      },
    },
    yAxis: yAxisConfig,
    legend: { enabled: false },
    plotOptions: {
      spline: {
        marker: { enabled: true, radius: 4 },
        lineWidth: 2,
        enableMouseTracking: true,
        dataLabels: {
          enabled: true,
          style: { fontSize: "10px", color: "#444" },
        },
      },
    },
    series: [
      {
        name: title,
        data: data,
        color: color,
        marker: { fillColor: color },
      },
    ],
  });
}

function renderBigChart(chartType) {
  if (!currentPatientData) {
    showToast("No data for chart");
    return;
  }

  const vitalsSorted = currentPatientData.averageVitals
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const categories = vitalsSorted.map((v) => v.date.split("T")[0]);
  let data = [];
  let title = "";
  let color = "";
  let plotBand = null;
  let yAxisConfig = { title: { text: "" } };

  if (chartType === "bpm") {
    data = vitalsSorted.map((v) => v.averagePulse);
    title = "Pulse (BPM)";
    color = "#90ee90";
    plotBand = {
      from: 60,
      to: 100,
      color: "rgba(144, 238, 144, 0.2)",
      label: {
        text: "",
        style: { color: "#606060", fontSize: "12px" },
      },
    };
    yAxisConfig.min = 50;
    yAxisConfig.max = 130;
    yAxisConfig.tickInterval = 10;
  } else if (chartType === "temp") {
    data = vitalsSorted.map((v) => v.averageTemperature);
    title = "Temperature (°C)";
    color = "#ffb6c1";
    plotBand = {
      from: 36.1,
      to: 37.2,
      color: "rgba(255, 182, 193, 0.2)",
      label: {
        text: "",
        style: { color: "#606060", fontSize: "12px" },
      },
    };
    yAxisConfig.min = 35;
    yAxisConfig.max = 40;
    yAxisConfig.tickInterval = 0.3;
  } else if (chartType === "oxygen") {
    data = vitalsSorted.map((v) => v.averageOxygen);
    title = "Oxygen (%)";
    color = "#9EB3FD";
    plotBand = {
      from: 95,
      to: 100,
      color: "rgba(158, 179, 253, 0.2)",
      label: {
        text: "",
        style: { color: "#606060", fontSize: "12px" },
      },
    };
    yAxisConfig.min = 88;
    yAxisConfig.max = 100;
    yAxisConfig.tickInterval = 2;
  }

  if (plotBand) {
    yAxisConfig.plotBands = [plotBand];
  }

  Highcharts.chart("big-chart", {
    chart: { type: "spline", backgroundColor: "#fff", height: "500px" },
    title: { text: title, style: { fontSize: "24px", color: "#333" } },
    xAxis: {
      categories,
      labels: { style: { fontSize: "12px", color: "#666" } },
    },
    yAxis: yAxisConfig,
    plotOptions: {
      spline: {
        lineWidth: 4,
        marker: { enabled: true, radius: 6 },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#000",
            textOutline: "none",
          },
          formatter: function () {
            return this.y;
          },
        },
      },
    },
    series: [
      {
        name: title,
        data: data,
        color: color,
        marker: { symbol: "circle" },
      },
    ],
  });
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

document.querySelectorAll(".vital-signs-chart").forEach((chart) => {
  chart.addEventListener("click", (e) => {
    const chartType = chart.getAttribute("data-chart-type");
    openChartModal(chartType);
  });
});

function openChartModal(chartType) {
  const modal = document.getElementById("chart-modal");
  modal.style.display = "block";
  renderBigChart(chartType);
}

document.querySelector(".close-btn").onclick = closeModal;
window.onclick = function (event) {
  const modal = document.getElementById("chart-modal");
  if (event.target === modal) closeModal();
};

function closeModal() {
  document.getElementById("chart-modal").style.display = "none";
  document.getElementById("modal-chart-container").innerHTML =
    '<div id="big-chart" style="width: 100%; height: 500px"></div>';
}

const addButton = document.querySelector(".add-button");
const contentContainer = document.getElementById("content-container");
const contentContainer2 = document.getElementById("content-container-2");
const backButton = document.getElementById("back-button");

addButton.addEventListener("click", () => {
  contentContainer.style.display = "none";
  contentContainer2.style.display = "flex";
  loadAvailableDevices("select-device");
});

backButton.addEventListener("click", () => {
  contentContainer2.style.display = "none";
  contentContainer.style.display = "flex";
});

document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("caregiver-password");
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });

const fileInput = document.getElementById("fileUpload");
const imageUrlInput = document.createElement("input"); // Campo oculto para la URL
imageUrlInput.type = "hidden";
imageUrlInput.id = "imageUrl";
document.getElementById("user-form").appendChild(imageUrlInput);

// Función para subir imagen a Cloudinary
async function uploadImageToCloudinary(file, signal) {
  const urlCloudinary = "https://api.cloudinary.com/v1_1/drrbpmn8j/upload";
  const unsignedUploadPreset = "sensecare";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", unsignedUploadPreset);

  const response = await fetch(urlCloudinary, {
    method: "POST",
    body: formData,
    signal: signal,
  });

  if (!response.ok) throw new Error(await response.text());

  const data = await response.json();
  return data.secure_url; // Esta es la URL pública de la imagen subida
}

// Variables para el estado de subida
let isUploading = false;
let uploadAbortController = null;

// Event listener para cuando se selecciona una imagen
fileInput.addEventListener("change", async function () {
  const label = document.querySelector(".custom-file-label");

  if (this.files && this.files.length > 0) {
    const fileName = this.files[0].name;

    if (label) label.textContent = `Subiendo ${fileName}...`;

    // Cancelar subida anterior si existe
    if (isUploading && uploadAbortController) {
      uploadAbortController.abort();
    }

    try {
      isUploading = true;
      uploadAbortController = new AbortController();

      // Subir la imagen a Cloudinary inmediatamente
      const imageUrl = await uploadImageToCloudinary(
        this.files[0],
        uploadAbortController.signal
      );

      // Guardar la URL en el campo oculto
      imageUrlInput.value = imageUrl;

      if (label) label.textContent = `${fileName} (Listo)`;
      showToast("Imagen subida correctamente", "success");

      console.log("Imagen subida a Cloudinary:", imageUrl);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error al subir imagen a Cloudinary:", error);
        if (label) label.textContent = "Error al subir, intenta nuevamente";
        showToast("Error al subir la imagen", "error");
        fileInput.value = ""; // Limpiar el input
        imageUrlInput.value = ""; // Limpiar la URL también
      }
    } finally {
      isUploading = false;
      uploadAbortController = null;
    }
  } else {
    // Si no hay archivo seleccionado
    if (label) label.textContent = "Subir Imagen";
    imageUrlInput.value = "";
  }
});

// Submit del formulario
document
  .getElementById("user-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
    submitBtn.disabled = true;

    try {
      if (isUploading) {
        showToast("Espera a que termine de subir la imagen", "warning");
        return;
      }

      // Datos Cuidador
      const cuidadorData = {
        nombre: document.getElementById("caregiver-name").value.trim(),
        apellidoPa: document.getElementById("caregiver-sur-name").value.trim(),
        apellidoMa:
          document.getElementById("caregiver-last-name").value.trim() || "",
        foto: "",
        fecNac: document.getElementById("caregiver-date-birth").value,
        sexo: document.getElementById("caregiver-gender").value,
        dirColonia: "",
        dirCalle: "",
        dirNum: "",
        telefono: document
          .getElementById("caregiver-phone-number")
          .value.trim(),
        email: document.getElementById("caregiver-email").value.trim(),
        contrasena: document.getElementById("caregiver-password").value.trim(),
        activo: true,
        idTipoUsuario: {
          _id: "CUID",
          descripcion: "Caregiver",
        },
      };

      // Crear cuidador
      const cuidadorResponse = await fetch(`${config.api.apiURL}/Users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuidadorData),
      });

      if (!cuidadorResponse.ok)
        throw new Error("Error al crear el usuario cuidador");

      const cuidadorResult = await cuidadorResponse.json();
      const cuidadorId = cuidadorResult.data.id;
      const medicoId = localStorage.getItem("userId");

      // Datos Paciente
      const pacienteData = {
        nombre: document.getElementById("patient-name").value.trim(),
        apellidoPa: document.getElementById("sur-name").value.trim(),
        apellidoMa: document.getElementById("last-name").value.trim() || "",
        foto: imageUrlInput.value || "",
        fecNac: document.getElementById("date-birth").value,
        sexo: document.getElementById("patient-gender").value,
        dirColonia: document.getElementById("colonia").value.trim(),
        dirCalle: document.getElementById("street").value.trim(),
        dirNum: document.getElementById("number").value.trim(),
        telefono: document.getElementById("phone-number").value.trim(),
        idCuidador: parseInt(cuidadorId),
        idMedico: parseInt(medicoId),
        idDispositivo: parseInt(document.getElementById("device-select").value),
      };

      console.log("Datos del paciente:", pacienteData);

      // Crear paciente
      const pacienteResponse = await fetch(
        `${config.api.apiURL}/Patient/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pacienteData),
        }
      );

      if (!pacienteResponse.ok) {
        const errorData = await pacienteResponse.json();
        throw new Error(errorData.message || "Error al crear paciente");
      }

      showToast("Paciente y cuidador creados exitosamente", "success");

      setTimeout(() => {
        window.location.href = "/patients";
      }, 2000);
    } catch (error) {
      console.error(error);
      showToast(error.message, "error");
    } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  });

function openInfoModal(patientData) {
  selectedPatientData = patientData.patient[0];

  const modal = document.getElementById("report-modal");
  const modalContent = modal.querySelector(".report-modal-content");

  const patient = patientData.patient[0].paciente;
  const caregiver = patientData.patient[0].cuidador;
  const device = patientData.patient[0].dispositivo;

  modal.classList.remove("modal-initial");
  modalContent.classList.remove("modal-initial");

  modal.querySelector(
    ".section-title.full-name"
  ).nextElementSibling.textContent = `${patient.nombre} ${patient.apellidoPa} ${patient.apellidoMa}`;

  if (patient.fecNac) {
    const birthDate = new Date(patient.fecNac);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    modal.querySelector(
      ".section-title.age"
    ).nextElementSibling.textContent = `${age} years old`;
  } else {
    modal.querySelector(".section-title.age").nextElementSibling.textContent =
      "Edad no disponible";
  }

  modal.querySelector(".section-title.gender").nextElementSibling.textContent =
    patient.sexo || "";

  modal.querySelector(
    ".section-title.address"
  ).nextElementSibling.textContent = `${patient.dirColonia} ${patient.dirCalle} ${patient.dirNum}`;

  modal.querySelector(".section-title.phone").nextElementSibling.textContent =
    patient.telefono || "";

  modal.querySelector(
    ".section-title.caregiver-full-name"
  ).nextElementSibling.textContent = `${caregiver.nombre} ${caregiver.apellidoPa} ${caregiver.apellidoMa}`;

  modal.querySelector(
    ".section-title.caregiver-phone"
  ).nextElementSibling.textContent = caregiver.telefono || "";

  modal.querySelector(
    ".section-title.caregiver-email"
  ).nextElementSibling.textContent = caregiver.email || "";

  if (caregiver.fecNac) {
    const birthDate = new Date(caregiver.fecNac);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    modal.querySelector(
      ".section-title.caregiver-age"
    ).nextElementSibling.textContent = `${age} years old`;
  } else {
    modal.querySelector(
      ".section-title.caregiver-age"
    ).nextElementSibling.textContent = "Edad no disponible";
  }

  modal.querySelector(
    ".section-title.caregiver-gender"
  ).nextElementSibling.textContent = caregiver.sexo || "";

  modal.classList.add("active");

  const closeBtn = modal.querySelector(".close-btn");

  function closeModal() {
    modal.classList.remove("active");
    modal.classList.add("modal-initial");
    modalContent.classList.add("modal-initial");
  }

  closeBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };
}

async function prepareUpdateForm(patientData) {
  const deviceAssigned = patientData.dispositivo;

  await loadAvailableDevicesUp();

  const deviceSelect = document.getElementById("update-device-select");

  const existsInList = Array.from(deviceSelect.options).some(
    (opt) => opt.value === deviceAssigned.id.toString()
  );

  if (!existsInList) {
    const assignedOption = document.createElement("option");
    assignedOption.value = deviceAssigned.id.toString();
    assignedOption.textContent = `Device #${deviceAssigned.id} (Assigned)`;
    deviceSelect.insertBefore(assignedOption, deviceSelect.firstChild);
  }

  deviceSelect.value = deviceAssigned.id.toString();

  fillUpdateForm(patientData);
}

const updateBtn = document.querySelector(".update-button");
const reportModal = document.getElementById("report-modal");
const modalContent = reportModal.querySelector(".report-modal-content");

updateBtn.addEventListener("click", async () => {
  reportModal.classList.remove("active");
  reportModal.classList.add("modal-initial");
  modalContent.classList.add("modal-initial");

  document.getElementById("content-container").style.display = "none";
  document.getElementById("content-container-3").style.display = "block";

  await prepareUpdateForm(selectedPatientData);
});

const backButton2 = document.getElementById("back-button2");
const contentContainer3 = document.getElementById("content-container-3");

backButton2.addEventListener("click", () => {
  contentContainer3.style.display = "none";
  contentContainer.style.display = "flex";
});

function fillUpdateForm(patientData) {
  const patient = patientData.paciente;
  const cuidador = patientData.cuidador;

  document.getElementById("update-name").value = patient.nombre || "";
  document.getElementById("update-sur-name").value = patient.apellidoPa || "";
  document.getElementById("update-last-name").value = patient.apellidoMa || "";
  document.getElementById("update-date-birth").value = formatDateForInput(
    patient.fecNac
  );
  document.getElementById("update-gender").value = patient.sexo
    ? patient.sexo.toLowerCase()
    : "";
  document.getElementById("update-colonia").value = patient.dirColonia || "";
  document.getElementById("update-street").value = patient.dirCalle || "";
  document.getElementById("update-number").value = patient.dirNum || "";
  document.getElementById("update-phone-number").value = patient.telefono || "";

  // Dispositivo (si tienes asignación automática, seleccionarlo aquí)
  // document.getElementById("device-select").value = device.id
  //   ? device.id.toLowerCase()
  //   : "";

  document.getElementById("update-caregiver-name").value =
    cuidador.nombre || "";
  document.getElementById("update-caregiver-sur-name").value =
    cuidador.apellidoPa || "";
  document.getElementById("update-caregiver-last-name").value =
    cuidador.apellidoMa || "";
  document.getElementById("update-caregiver-date-birth").value =
    formatDateForInput(cuidador.fecNac);
  document.getElementById("update-caregiver-gender").value = cuidador.sexo
    ? cuidador.sexo.toLowerCase()
    : "";
  document.getElementById("update-caregiver-phone-number").value =
    cuidador.telefono || "";
  document.getElementById("update-caregiver-email").value =
    cuidador.email || "";

  // document.getElementById("update-caregiver-password").value = "";
}

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
}

const updateSubmitBtn = document.querySelector(".update-submit-button");

updateSubmitBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const patientData = {
      id: selectedPatientData.paciente.id,
      nombre: document.getElementById("update-name").value.trim(),
      apellidoPa: document.getElementById("update-sur-name").value.trim(),
      apellidoMa: document.getElementById("update-last-name").value.trim(),
      fecNac: document.getElementById("update-date-birth").value
        ? new Date(
            document.getElementById("update-date-birth").value
          ).toISOString()
        : null,
      sexo: document.getElementById("update-gender").value,
      dirColonia: document.getElementById("update-colonia").value.trim(),
      dirCalle: document.getElementById("update-street").value.trim(),
      dirNum: document.getElementById("update-number").value.trim(),
      telefono: document.getElementById("update-phone-number").value.trim(),
    };

    const caregiverData = {
      id: selectedPatientData.cuidador.id,
      nombre: document.getElementById("update-caregiver-name").value.trim(),
      apellidoPa: document
        .getElementById("update-caregiver-sur-name")
        .value.trim(),
      apellidoMa: document
        .getElementById("update-caregiver-last-name")
        .value.trim(),
      fecNac: document.getElementById("update-caregiver-date-birth").value
        ? new Date(
            document.getElementById("update-caregiver-date-birth").value
          ).toISOString()
        : null,
      sexo: document.getElementById("update-caregiver-gender").value,
      telefono: document
        .getElementById("update-caregiver-phone-number")
        .value.trim(),
      email: document.getElementById("update-caregiver-email").value.trim(),
    };

    const selectedDeviceId = parseInt(
      document.getElementById("update-device-select").value
    );

    console.log("IDDevice selected: ", selectedDeviceId);

    const patientResponse = await fetch(
      `${config.api.apiURL}/Users/updateUser`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      }
    );

    if (!patientResponse.ok) throw new Error("Failed to update patient data");

    const caregiverResponse = await fetch(
      `${config.api.apiURL}/Users/updateUser`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caregiverData),
      }
    );

    if (!caregiverResponse.ok)
      throw new Error("Failed to update caregiver data");

    const deviceAssignResponse = await fetch(
      `${config.api.apiURL}/Device/assignDeviceToPatient`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idPaciente: selectedPatientData.paciente.id,
          idDispositivo: selectedDeviceId,
        }),
      }
    );
    if (!deviceAssignResponse.ok)
      throw new Error("Failed to assign device to patient");

    showToast("Patient and caregiver updated succesfully!", "success");
    setTimeout(() => {
      const input = document.getElementById("search-patient");
      const results = document.getElementById("search-results");
      selectPatientAndRender(allPatients[0], input, results);
    }, 3000);
  } catch (err) {
    console.error("Update Error:", err);
    showToast("There was an error.", "error");
  }
});

const disableBtn = document.querySelector(".disable-button");
const confirmModal = document.getElementById("confirm-disable-modal");
const confirmYesBtn = document.getElementById("confirm-disable-yes");
const confirmNoBtn = document.getElementById("confirm-disable-no");
// const reportModal = document.getElementById("report-modal");
// const modalContent = reportModal.querySelector(".report-modal-content");

disableBtn.addEventListener("click", () => {
  confirmModal.classList.add("active");
  confirmModal.classList.remove("modal-initial");
});

confirmNoBtn.addEventListener("click", () => {
  confirmModal.classList.remove("active");
  confirmModal.classList.add("modal-initial");
});

confirmYesBtn.addEventListener("click", async () => {
  disablePatient(selectedPatientData.id);
  confirmModal.classList.remove("active");
  confirmModal.classList.add("modal-initial");

  reportModal.classList.remove("active");
  reportModal.classList.add("modal-initial");
  modalContent.classList.add("modal-initial");

  showToast("Patient disabled succesfully", "success");
  console.log("Patient disabled succesfully");
});

async function disablePatient(patientId) {
  try {
    console.log("Disabling patient: ", patientId);
    const response = await fetch(
      `http://localhost:5221/api/Users/disable/${patientId}?activate=false`,
      {
        method: "PUT",
      }
    );

    if (!response.ok) throw new Error("Failed to disable patient.");

    const result = await response.json();
    console.log(result.message);
  } catch (err) {
    console.error("Error disabling patient:", err);
  }
}
