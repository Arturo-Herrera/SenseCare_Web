import { selectPatient } from "./services.js";

selectPatient().then((response) => {
  const patients = Array.isArray(response) ? response : response.data; // Ajusta según tu backend

  const select = document.getElementById("patient-select");
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a patient";
  select.appendChild(defaultOption);

  patients.forEach(patient => {
    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = `${patient.fullName}`;
    select.appendChild(option);
  });

  console.log(patients);

}).catch((error) => {
  console.error("Error fetching patients:", error);
});