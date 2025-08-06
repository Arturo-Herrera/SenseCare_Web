import { config } from "../../../js/config.js";

let currentAlerts = [];

export async function getHistoryData(idPatient) {
  const endpoint = `${config.api.apiURL}/Report/medicalHistory/data/${idPatient}`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Error fetching history data: ${response.statusText}`);
    }

    const data = await response.json();

    // Asegurar que currentAlerts sea siempre un array
    currentAlerts = Array.isArray(data.alertsPatient) ? data.alertsPatient : [];

    console.log("History data received:", data);
    return data;
  } catch (err) {
    console.error("Failed to fetch history data:", err);
    throw err;
  }
}

export async function selectPatient() {
  const idDoctor = localStorage.getItem("userId");

  const endpoint = `${config.api.apiURL}/Patient/getSelect/${idDoctor}`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Error fetching patients data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Patients data received:", data);
    return data;
  } catch (err) {
    console.error("Failed to fetch patients data:", err);
    throw err;
  }
}

export async function sendReport({
  reason,
  diagnosis,
  medicine,
  dosis,
  duration,
  observations,
  idDoctor,
  idPatient,
}) {
  const endpoint = `${config.api.apiURL}/Report`;

  // PAYLOAD CORREGIDO según el formato que funciona en el backend
  const reportData = {
    reason: reason.trim(),
    diagnosis: diagnosis.trim(),
    treatment: {
      medicine: medicine.trim(),
      dosis: dosis.trim(),
      duration: duration.trim(),
    },
    observations: observations.trim(),
    idDoctor: Number(idDoctor),
    idPatient: Number(idPatient),
    nombreCompletoMedico: "Jesus Herrera Luevano"
  };

  console.log("Sending report payload:", JSON.stringify(reportData, null, 2));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(reportData),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);

    if (!response.ok) {
      // Intentar obtener más detalles del error
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.text();
        console.error("Error response body:", errorData);
        errorMessage += ` - ${errorData}`;
      } catch (e) {
        // Si no se puede leer el cuerpo del error, usar solo el status
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Report sent successfully:", data);
    return data;
  } catch (err) {
    console.error("Failed to send report:", err);
    throw err;
  }
}
