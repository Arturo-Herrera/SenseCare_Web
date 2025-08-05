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
    data.data.manualSignsPerDay.promedioSignosPorDia  || "N/A";

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
  const vitals = data.data.averageVitals;

  const categories = vitals.map((v) => v.fecha);
  const tempData = vitals.map((v) => v.promedioTemperatura);
  const bpmData = vitals.map((v) => v.promedioPulso);

  // Gráfica de Pulso (BPM)
  Highcharts.chart("chart-bpm", {
    chart: {
      type: "spline",
      backgroundColor: "transparent",
    },
    title: { text: "" },
    xAxis: {
      categories: categories,
      lineColor: "#ccc",
      tickColor: "#ccc",
      labels: {
        style: {
          fontSize: "8px",
          color: "#666",
        },
      },
    },
    yAxis: {
      title: { text: "BPM" },
      gridLineColor: "#eee",
      min: 50,
      max: 120,
      tickInterval: 10,
      plotBands: [
        {
          from: 60,
          to: 100,
          color: "rgba(144, 238, 144, 0.2)", // Verde suave
          label: {
            text: "",
            style: { color: "#606060", fontSize: "10px" },
          },
        },
      ],
    },
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
        name: "BPM",
        data: bpmData,
        color: "#90EE90",
        marker: {
          enabled: true,
          radius: 6,
          symbol: "circle",
          lineColor: "#90EE90",
          lineWidth: 3,
          fillColor: "#90EE90",
        },
      },
    ],
  });

  // Gráfica de Temperatura (°C)
  Highcharts.chart("chart-temp", {
    chart: {
      type: "spline",
      backgroundColor: "transparent",
    },
    title: { text: "" },
    xAxis: {
      categories: categories,
      lineColor: "#ccc",
      tickColor: "#ccc",
      labels: {
        style: {
          fontSize: "8px",
          color: "#666",
        },
      },
    },
    yAxis: {
      title: { text: "°C" },
      gridLineColor: "#eee",
      min: 35,
      max: 40,
      tickInterval: 0.3,
      plotBands: [
        {
          from: 36.1,
          to: 37.2,
          color: "rgba(255, 182, 193, 0.2)", // Rosa suave
          label: {
            text: "",
            style: { color: "#606060", fontSize: "10px" },
          },
        },
      ],
    },
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
        name: "Temperature",
        data: tempData,
        color: "#FFB6C1",
        marker: {
          enabled: true,
          radius: 6,
          symbol: "circle",
          lineColor: "#FFB6C1",
          lineWidth: 3,
          fillColor: "#FFB6C1",
        },
      },
    ],
  });
}
