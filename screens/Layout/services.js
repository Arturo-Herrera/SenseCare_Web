import { config } from "../../../js/config.js";

export async function getDeviceData() {
  const endpoint = `${config.api.apiURL}/Map/info`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Error fetching device data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (err) {
    console.error("Failed to fetch device data:", err);
    throw err;
  }
}
