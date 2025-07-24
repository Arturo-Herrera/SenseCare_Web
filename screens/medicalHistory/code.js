import { selectPatient, getHistoryData } from "./services.js";

function renderHistoryData(idPatient) {
    getHistoryData(idPatient).then((data) => {
        renderAlerts(data.alertsPatient);
        renderReports(data.reportsPatient);
    }).catch((error) => {
        console.error("Error fetching medical history data:", error);
        const alertsContainer = document.getElementById("alerts-container");
        const reportsContainer = document.getElementById("reports-container");
        if (alertsContainer) alertsContainer.innerHTML = "<p class='error-message'>Error loading alerts.</p>";
        if (reportsContainer) reportsContainer.innerHTML = "<p class='error-message'>Error loading medical history.</p>";
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
        alertsData.forEach(alert => {
            const alertItem = document.createElement("div");
            const alertClass = getAlertClass(alert.idTipoAlerta);
            alertItem.className = `alert-item ${alertClass}`;
            alertItem.innerHTML = `
                <div class="alert-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="alert-content">
                    <span class="alert-text">${alert.idTipoAlerta || "Alert"}</span>
                    <span class="alert-time">${formatDateTime(alert.fecha)}</span>
                </div>`;
            alertsContainer.appendChild(alertItem);
        });
    } else {
        alertsContainer.innerHTML = "<p class='no-data-message'>No alerts available.</p>";
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
        const sortedReports = reportsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedReports.forEach(report => {
            const reportItem = document.createElement("div");
            reportItem.className = "report-item";
            reportItem.innerHTML = `
                <div class="report-header">
                    <span class="report-id">Number: ${report.id}</span>
                    <span class="report-date">${formatDate(report.date)}</span>
                </div>
                <div class="report-content">
                    <h3 class="report-reason">Reason: ${report.reason}</h3>
                    <p class="report-doctor">Dr. ${report.nombreCompletoMedico}</p>
                </div>`;
            reportItem.addEventListener("click", () => {
                openReportModal(report);
            });
            reportsContainer.appendChild(reportItem);
        });
    } else {
        reportsContainer.innerHTML = "<p class='no-data-message'>No medical reports available.</p>";
    }
}

function openReportModal(report) {
    const modal = document.getElementById("report-modal");
    const modalContent = modal.querySelector(".report-modal-content");

    modal.classList.remove("modal-initial");
    modalContent.classList.remove("modal-initial");

    modal.querySelector(".report-id").textContent = `ID: ${report.id}`;
    modal.querySelector(".report-date").textContent = `Date: ${formatDate(report.date)}`;

    modal.querySelector(".section-title.reason").nextElementSibling.textContent = report.reason || "";
    modal.querySelector(".section-title.diagnosis").nextElementSibling.textContent = report.diagnosis || "";

    const treatmentDetails = modal.querySelector(".treatment-details");
    treatmentDetails.innerHTML = "";
    if (report.treatment) {
        if (report.treatment.medicine) {
            const med = document.createElement("p");
            med.textContent = `Medicine: ${report.treatment.medicine}`;
            treatmentDetails.appendChild(med);
        }
        if (report.treatment.dose) {
            const dose = document.createElement("p");
            dose.textContent = `Dose: ${report.treatment.dose}`;
            treatmentDetails.appendChild(dose);
        }
        if (report.treatment.duration) {
            const duration = document.createElement("p");
            duration.textContent = `Duration: ${report.treatment.duration}`;
            treatmentDetails.appendChild(duration);
        }
    }

    modal.querySelector(".section-title.observations").nextElementSibling.textContent = report.observations || "";
    modal.querySelector(".doctor-container p").textContent = report.nombreCompletoMedico || "";

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
    switch(alertType?.toLowerCase()) {
        case 'sos': return 'sos';
        case 'urgent':
        case 'urgente': return 'urgent';
        case 'warning':
        case 'advertencia': return 'warning';
        default: return 'info';
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
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

selectPatient().then((response) => {
  const patients = Array.isArray(response) ? response : response.data;

  const select = document.getElementById("patient-select");
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a patient";
  select.appendChild(defaultOption);

  patients.forEach(patient => {
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
        document.getElementById("alerts-container").innerHTML = "";
        document.getElementById("reports-container").innerHTML = "";
    }
  });

}).catch((error) => {
  console.error("Error fetching patients:", error);
});
