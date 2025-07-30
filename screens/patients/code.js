import { getPatientData, selectPatient } from "./services.js";

// Variable global para almacenar todos los pacientes
let allPatients = [];
let currentPatientData = {};

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

// También inicializar si el DOM ya está cargado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePatientSearch);
} else {
  initializePatientSearch();
}

// Resto de funciones (sin cambios)
function renderPatientData(idPatient) {
  console.log("Obteniendo datos del paciente:", idPatient);

  getPatientData(idPatient)
    .then((data) => {
      console.log("Datos recibidos:", data);

      if (data.patient && data.patient.length > 0) {
        const patientData = data.patient[0].paciente;
        renderInfoPatient(patientData);
        updateDashboard(data);

        currentPatientData = data;

        if (data.lectures && data.lectures.length > 0) {
          renderLectures(data.lectures);
        }

        if (data.alerts && data.alerts.length > 0) {
          renderAlerts(data.alerts);
        }
      } else {
        showToast("No patient data found");
      }
    })
    .catch((error) => {
      console.error("Error fetching patient data:", error);
    });
}

function renderInfoPatient(data) {
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
}

function renderLectures(lectures) {
  const recentLectures = lectures.slice(0, 3);
  const lectureCards = document.querySelectorAll(".lecture-card");

  recentLectures.forEach((lecture, index) => {
    if (lectureCards[index]) {
      const card = lectureCards[index];
      const stats = card.querySelectorAll(".stat p");

      if (stats[0]) {
        stats[0].textContent = `${lecture.pulsoPromedio || "N/A"} BPM`;
      }

      if (stats[1]) {
        stats[1].textContent = `${lecture.temperatura || "N/A"} °C`;
      }

      if (stats[2]) {
        stats[2].textContent = `${lecture.oxigeno || "N/A"} %`;
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
  Highcharts.chart(containerId, {
    chart: {
      type: "spline",
      backgroundColor: "transparent",
    },
    title: { text: title, style: { fontSize: "1.2rem", color: "#44749D" } },
    xAxis: {
      categories: categories,
      lineColor: "#ccc",
      tickColor: "#ccc",
      labels: {
        style: {
          fontSize: "10px",
          color: "#666",
        },
        rotation: -45,
      },
    },
    yAxis: {
      title: { text: "" },
      gridLineColor: "#f5f5f5",
    },
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

// Cerrar modal
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

  if (chartType === "bpm") {
    data = vitalsSorted.map((v) => v.averagePulse);
    title = "Pulse (BPM)";
    color = "#90ee90";
  } else if (chartType === "temp") {
    data = vitalsSorted.map((v) => v.averageTemperature);
    title = "Temperature (°C)";
    color = "#ffb6c1";
  } else if (chartType === "oxygen") {
    data = vitalsSorted.map((v) => v.averageOxygen);
    title = "Oxygen (%)";
    color = "#9EB3FD";
  }

  Highcharts.chart("big-chart", {
    chart: { type: "spline", backgroundColor: "#fff", height: "500px" },
    title: { text: title, style: { fontSize: "24px", color: "#333" } },
    xAxis: {
      categories,
      labels: {
        style: {
          fontSize: "12px",
          color: "#666",
        },
      },
    },
    yAxis: { title: { text: "" } },
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
