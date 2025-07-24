import { getUserData } from "./services.js";

// Función para renderizar los cards
function renderCards(typeUser = "", active = "") {
    getUserData(typeUser, active).then((data) => {
        const users = Array.isArray(data) ? data : [data];
        const container = document.getElementById("card-container");
        container.innerHTML = "";

        users.forEach(user => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <div class="name">${user.fullName || "N/A"}</div>
                <div class="role">${user.descriptionUserType || "N/A"}</div>
                <div class="status">${user.active ? "Active" : "Inactive"}</div>
                <div class="circle ${user.active ? "green" : "red"}"></div>
                <div class="icon"></div>
            `;
            container.appendChild(card);
        });
    }).catch((error) => {
        console.error("Error fetching user data:", error);
    });
}

// Inicializa los cards y el select
getUserData().then((data) => {
    const select = document.getElementById("filter-select");
    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "All";
    select.appendChild(defaultOption);

    const tiposUnicos = [];
    const idsAgregados = new Set();

    data.forEach(user => {
        if (!idsAgregados.has(user.idUserType)) {
            tiposUnicos.push({
                id: user.idUserType,
                descripcion: user.descriptionUserType
            });
            idsAgregados.add(user.idUserType);
        }
    });

    tiposUnicos.forEach(tipo => {
        const option = document.createElement("option");
        option.value = tipo.id;
        option.textContent = tipo.descripcion || "N/A";
        select.appendChild(option);
    });

    // Renderiza todos los cards al inicio
    renderCards();

    // Actualiza los cards al cambiar el select
    select.addEventListener("change", (e) => {
        renderCards(e.target.value);
    });
}).catch((error) => {
    console.error("Error fetching user types:", error);
});

