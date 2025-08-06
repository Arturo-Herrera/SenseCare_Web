import { config } from "../../../js/config.js";

export async function getPatientData(idPatient) {
  const endpoint = `${config.api.apiURL}/Patient/patients/data/`  + idPatient;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Error fetching patient data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (err) {
    console.error("Failed to fetch patient data:", err);
    throw err;
  }
}

export async function selectPatient() {
  const idDoctor = localStorage.getItem("userId")
  const endpoint = `${config.api.apiURL}/Patient/getSelect/${idDoctor}`;
  
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Error fetching patients data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (err) {
    console.error("Failed to fetch patients data:", err);
    throw err;
  }
}
