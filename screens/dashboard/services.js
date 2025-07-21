import { config } from "../../js/config.js";

export async function getDashboardData() {
  const endpoint = `${config.api.apiURL}/patient/dashboard/data`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Error fetching dashboard data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
    throw err;
  }
}
