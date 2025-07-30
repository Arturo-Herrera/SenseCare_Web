import { selectPatient, getHistoryData, sendReport } from "./services.js";

function checkAuthentication() {
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  if (!userId || userRole !== "MED") {
    location.href = "/screens/login/login.html";
    return false;
  }
  return true;
}

if (!checkAuthentication()) {
  throw new Error("Authentication required");
}

function renderHistoryData(idPatient) {
  getHistoryData(idPatient)
    .then((data) => {
      renderAlerts(data.alertsPatient);
      renderReports(data.reportsPatient);
    })
    .catch((error) => {
      console.error("Error fetching medical history data:", error);
      const alertsContainer = document.getElementById("alerts-container");
      const reportsContainer = document.getElementById("reports-container");
      if (alertsContainer)
        alertsContainer.innerHTML =
          "<p class='error-message'>Error loading alerts.</p>";
      if (reportsContainer)
        reportsContainer.innerHTML =
          "<p class='error-message'>Error loading medical history.</p>";
    });
}

function renderAlerts(alertsData) {
  const alertsContainer = document.getElementById("alerts-container");
  if (!alertsContainer) {
    console.error("Alerts container not found");
    return;
  }
  alertsContainer.innerHTML = "";
  if (alertsData && alertsData.length > 0) {
    alertsData.forEach((alert) => {
      const alertItem = document.createElement("div");
      const alertClass = getAlertClass(alert.idTipoAlerta);
      alertItem.className = `alert-item ${alertClass}`;
      alertItem.innerHTML = `
                <div class="alert-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="alert-content">
                    <span class="alert-text">${
                      alert.signoAfectado || "Alert"
                    }  Alert</span>
                    <span class="alert-time">${formatDateTime(
                      alert.fecha
                    )}</span>
                </div>`;
      alertsContainer.appendChild(alertItem);
    });
  } else {
    alertsContainer.innerHTML =
      "<p class='no-data-message'>No alerts available.</p>";
  }
}

function renderReports(reportsData) {
  const reportsContainer = document.getElementById("reports-container");
  if (!reportsContainer) {
    console.error("Reports container not found");
    return;
  }
  reportsContainer.innerHTML = "";
  if (reportsData && reportsData.length > 0) {
    const sortedReports = reportsData.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    sortedReports.forEach((report) => {
      const reportItem = document.createElement("div");
      reportItem.className = "report-item";
      reportItem.innerHTML = `
                <div class="report-header">
                    <span class="report-id">Number: ${report.id}</span>
                    <span class="report-date">${formatDate(report.date)}</span>
                </div>
                <div class="report-content">
                    <h3 class="report-reason">Reason: ${report.reason}</h3>
                    <p class="report-doctor">Dr. ${
                      report.nombreCompletoMedico
                    }</p>
                </div>`;
      reportItem.addEventListener("click", () => {
        openReportModal(report);
      });
      reportsContainer.appendChild(reportItem);
    });
  } else {
    reportsContainer.innerHTML =
      "<p class='no-data-message'>No medical reports available.</p>";
  }
}

function openReportModal(report) {
  const modal = document.getElementById("report-modal");
  const modalContent = modal.querySelector(".report-modal-content");

  modal.classList.remove("modal-initial");
  modalContent.classList.remove("modal-initial");

  modal.querySelector(".report-id").textContent = `ID: ${report.id}`;
  modal.querySelector(".report-date").textContent = `Date: ${formatDate(
    report.date
  )}`;

  modal.querySelector(".section-title.reason").nextElementSibling.textContent =
    report.reason || "";
  modal.querySelector(
    ".section-title.diagnosis"
  ).nextElementSibling.textContent = report.diagnosis || "";

  const treatmentDetails = modal.querySelector(".treatment-details");
  treatmentDetails.innerHTML = "";
  if (report.treatment) {
    if (report.treatment.medicine) {
      const med = document.createElement("p");
      med.textContent = `Medicine: ${report.treatment.medicine}`;
      treatmentDetails.appendChild(med);
    }
    if (report.treatment.dosis) {
      const dose = document.createElement("p");
      dose.textContent = `Dose: ${report.treatment.dosis}`;
      treatmentDetails.appendChild(dose);
    }
    if (report.treatment.duration) {
      const duration = document.createElement("p");
      duration.textContent = `Duration: ${report.treatment.duration}`;
      treatmentDetails.appendChild(duration);
    }
  }

  modal.querySelector(
    ".section-title.observations"
  ).nextElementSibling.textContent = report.observations || "";
  modal.querySelector(".doctor-container p").textContent =
    report.nombreCompletoMedico || "";

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

function getAlertClass(alertType) {
  switch (alertType?.toLowerCase()) {
    case "sos":
      return "sos";
    case "urgent":
    case "urgente":
      return "urgent";
    case "warn":
    case "advertencia":
      return "warning";
    default:
      return "info";
  }
}

function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

// Inicializar la carga de pacientes
// ... El resto de tu código permanece igual hasta después de renderHistoryData()

// Agregar búsqueda de pacientes por nombre con input + enter
let allPatients = []; // Se usará globalmente para búsqueda

selectPatient()
  .then((response) => {
    allPatients = Array.isArray(response) ? response : response.data;

    const select = document.getElementById("patient-select");
    const searchInput = document.getElementById("search-patient");
    const searchResults = document.getElementById("search-results");

    if (!select) {
      console.error("Patient select element not found");
      return;
    }

    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a patient";
    select.appendChild(defaultOption);

    allPatients.forEach((patient) => {
      const option = document.createElement("option");
      option.value = patient.id;
      option.textContent = `${patient.fullName}`;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      const idPatient = e.target.value;
      if (idPatient) {
        renderHistoryData(idPatient);
      } else {
        const alertsContainer = document.getElementById("alerts-container");
        const reportsContainer = document.getElementById("reports-container");
        if (alertsContainer) alertsContainer.innerHTML = "";
        if (reportsContainer) reportsContainer.innerHTML = "";
      }
    });

    if (searchInput && searchResults) {
      function showAllPatientsList() {
        searchResults.innerHTML = "";
        allPatients.forEach((patient) => {
          const li = document.createElement("li");
          li.textContent = patient.fullName;
          li.addEventListener("click", () => {
            searchInput.value = patient.fullName;
            searchResults.innerHTML = "";
            renderHistoryData(patient.id);
          });
          searchResults.appendChild(li);
        });
      }

      searchInput.addEventListener("focus", showAllPatientsList);
      searchInput.addEventListener("click", showAllPatientsList);

      searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = "";

        if (query.trim() === "") {
          showAllPatientsList();
          return;
        }

        const filtered = allPatients.filter((p) =>
          p.fullName.toLowerCase().includes(query)
        );

        filtered.forEach((patient) => {
          const li = document.createElement("li");
          li.textContent = patient.fullName;
          li.addEventListener("click", () => {
            searchInput.value = patient.fullName;
            searchResults.innerHTML = "";
            renderHistoryData(patient.id);
          });
          searchResults.appendChild(li);
        });
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const query = searchInput.value.toLowerCase();
          const match = allPatients.find((p) =>
            p.fullName.toLowerCase().includes(query)
          );

          if (match) {
            searchInput.value = match.fullName;
            searchResults.innerHTML = "";
            renderHistoryData(match.id);
          } else {
            console.log("No matching patient found");
          }
        }
      });
    }

    if (allPatients.length > 0) {
      renderHistoryData(allPatients[0].id);

      if (select) select.value = allPatients[0].id;
      if (searchInput) searchInput.value = allPatients[0].fullName;
    }
  })
  .catch((error) => {
    console.error("Error fetching patients:", error);
    showToast("Error loading patients", "error");
  });

const addReportBtn = document.querySelector(".add-report-btn");
if (addReportBtn) {
  addReportBtn.addEventListener("click", () => {
    const createReportContainer = document.getElementById(
      "create-report-container"
    );
    const alertsSection = document.querySelector(".alerts-section");
    const reportsSection = document.querySelector(".reports-section");

    if (createReportContainer) createReportContainer.style.display = "flex";
    if (alertsSection) alertsSection.style.display = "none";
    if (reportsSection) reportsSection.style.display = "none";
  });
}

const backButton = document.getElementById("back-button");
if (backButton) {
  backButton.addEventListener("click", () => {
    const createReportContainer = document.getElementById(
      "create-report-container"
    );
    const alertsSection = document.querySelector(".alerts-section");
    const reportsSection = document.querySelector(".reports-section");

    if (createReportContainer) createReportContainer.style.display = "none";
    if (alertsSection) alertsSection.style.display = "block";
    if (reportsSection) reportsSection.style.display = "block";
  });
}

const reportForm = document.getElementById("report-form");
if (reportForm) {
  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reason = document.getElementById("reason")?.value?.trim() || "";
    const diagnosis = document.getElementById("diagnosis")?.value?.trim() || "";
    const medicine = document.getElementById("medicine")?.value?.trim() || "";
    const dosis = document.getElementById("dosis")?.value?.trim() || "";
    const duration = document.getElementById("duration")?.value?.trim() || "";
    const observations =
      document.getElementById("observations")?.value?.trim() || "";

    if (
      !reason ||
      !diagnosis ||
      !medicine ||
      !dosis ||
      !duration ||
      !observations
    ) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    const patientSelect = document.getElementById("patient-select");
    if (!patientSelect || !patientSelect.value) {
      showToast("Please select a patient.", "error");
      return;
    }

    const idPatient = parseInt(patientSelect.value);
    if (isNaN(idPatient)) {
      showToast("Invalid patient selection.", "error");
      return;
    }

    const userIdFromStorage = localStorage.getItem("userId");
    if (!userIdFromStorage) {
      showToast("User session not found. Please login again.", "error");
      return;
    }

    const idDoctor = parseInt(userIdFromStorage);

    try {
      const submitButton = reportForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      await sendReport({
        reason,
        diagnosis,
        medicine,
        dosis,
        duration,
        observations,
        idDoctor,
        idPatient,
      });

      showToast("Report created successfully!", "success");
      reportForm.reset();

      // Volver a la vista principal
      const createReportContainer = document.getElementById(
        "create-report-container"
      );
      const alertsSection = document.querySelector(".alerts-section");
      const reportsSection = document.querySelector(".reports-section");

      if (createReportContainer) createReportContainer.style.display = "none";
      if (alertsSection) alertsSection.style.display = "block";
      if (reportsSection) reportsSection.style.display = "block";

      // CORREGIDO: Refrescar datos después de crear el reporte
      renderHistoryData(idPatient);
    } catch (error) {
      console.error("Error submitting report:", error);
      showToast(`Failed to send report: ${error.message}`, "error");
    } finally {
      // Restaurar estado del botón
      const submitButton = reportForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Report"; // O el texto original
      }
    }
  });
} else {
  console.error("Report form not found");
}
