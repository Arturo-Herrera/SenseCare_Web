import { config } from "../../../js/config.js";

// export async function getHistoryData(idPatient) {
//   const endpoint = `${config.api.apiURL}/Report/medicalHistory/data/` + idPatient;

//   try {
//     const response = await fetch(endpoint);

//     if (!response.ok) {
//       throw new Error(`Error fetching history data: ${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log(data);
//     return data;

//   } catch (err) {
//     console.error("Failed to fetch history data:", err);
//     throw err;
//   }
// }

export async function selectPatient() {
  const endpoint = `${config.api.apiURL}/Patient/getSelect`;
  
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Error fetching history data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (err) {
    console.error("Failed to fetch history data:", err);
    throw err;
  }
}
