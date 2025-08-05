import { getDashboardData } from "./services.js";

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
getDashboardData().then((data) => {
  console.log(data);

  document.getElementById("active-patients").textContent =
    data.data.activePatients.pacientesActivos;

  document.getElementById("avg-alerts-per-day").textContent =
    data.data.alertsPerDay.promedioAlertasPorDia || 0;

  document.getElementById("avg-oxygen-level").textContent =
    data.data.manualSignsPerDay.promedioSignosPorDia || "N/A";

  updateDashboard(data);
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

function updateDashboard(data) {
  const alertsPerHour = data.data.alertsPerHour;

  const categories = alertsPerHour.map((a) => a.hora);
  const alertsData = alertsPerHour.map((a) => a.totalAlertas);

  // Gráfica de Alertas por Hora
  Highcharts.chart("chart-bpm", {
    // Usa el div donde estaba el BPM, o cambia el ID si prefieres otro
    chart: {
      type: "column",
      backgroundColor: "transparent",
    },
    title: { text: "" },
    xAxis: {
      categories: categories,
      title: { text: "Hours" },
      lineColor: "#ccc",
      tickColor: "#ccc",
      labels: {
        style: {
          fontSize: "10px",
          color: "#666",
        },
      },
    },
    yAxis: {
      min: 0,
      title: { text: "Total alerts" },
      gridLineColor: "#eee",
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          style: { fontSize: "10px", color: "#444" },
        },
      },
    },
    series: [
      {
        name: "Alerts",
        data: alertsData,
        color: "#9CC3E6",
      },
    ],
  });
}
