import { getPatientData } from "./services.js";

getPatientData().then((data) => {
  console.log(data);

  document.getElementById("active-patients").textContent =
    data.activePatients.pacientesActivos;

    document.getElementById("avg-alerts-per-day").textContent =
    data.alertsPerDay.totalAlertas || 0;

    document.getElementById("avg-oxygen-level").textContent =
    data.oxygenLevel.promedioOxigeno + "%" || "N/A";
});
