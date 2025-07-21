import { getDashboardData } from "./services.js";

getDashboardData().then((data) => {
  console.log(data);

  document.getElementById("active-patients").textContent =
    data.data.activePatients.pacientesActivos;

    document.getElementById("avg-alerts-per-day").textContent =
    data.data.alertsPerDay.totalAlertas || 0;

    document.getElementById("avg-oxygen-level").textContent =
    data.data.oxygenLevel.promedioOxigeno + "%" || "N/A";
});
