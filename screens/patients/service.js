import { config } from "../../../js/config.js";

export async function getPatientData() {
  const endpoint = `${config.api.apiURL}/Patient`;

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
