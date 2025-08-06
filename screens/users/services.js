import { config } from "../../../js/config.js";

export async function getUserData(typeUser, active) {
  const endpoint = `${config.api.apiURL}/Users/filter`;
  
  const body = {};
    if (typeUser !== undefined && typeUser !== null && typeUser !== "") {
      body.role = typeUser;
    }
    if (active !== undefined && active !== null && active !== "") {
      body.active = active;
    }//? { "role" : "$typeUser" }

  //? console.log("Body que se envía:", JSON.stringify(body));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Error fetching user data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (err) {
    console.error("Failed to fetch user data:", err);
    throw err;
  } 
}

// export async function getUserByName(userName) {
//   const endpoint = `${config.api.apiURL}/Users/filter`;

//   try {
//     const response = await fetch(endpoint);

//     if (!response.ok) {
//       throw new Error(`Error fetching dashboard data: ${response.statusText}`);
//     }

//     const data = await response.json();
//     //* console.log(data);

//     // Filtrar por nombre de usuario
//     const filteredData = data.filter(user => user.fullName.toLowerCase().includes(userName.toLowerCase()));
//     if (filteredData.length === 0) {
//       throw new Error("No users found with the specified name.");
//     }

//     return filteredData;

//   } catch (err) {
//     console.error("Failed to fetch dashboard data:", err);
//     throw err;
//   }
// }