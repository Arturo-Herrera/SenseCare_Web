const menu = "../json/menu.json";
const screens = "../screens";

const sideMenu = document.getElementById("menu");
const content = document.getElementById("content");

let menuData;

init();

async function init() {
  try {
    menuData = await fetch(menu).then((res) => res.json());
    console.log(menuData);
  } catch (e) {
    console.error("Couldn't load menu:", e);
    content.textContent = "Error loading menu";
    return;
  }

  menuData.options.forEach((opt) => sideMenu.appendChild(drawOption(opt)));

  addLogoutButton(); // <-- AÑADIMOS EL BOTÓN DE LOGOUT AQUÍ

  const firstView = location.hash.slice(1) || menuData.options[0].component;
  await loadComponent(firstView);

  window.addEventListener("popstate", (e) =>
    loadComponent(e.state?.component || menuData.options[0].component)
  );
}

function drawOption({ icon, text, component }) {
  const divOption = document.createElement("div");
  divOption.className = "sidebar-option";
  divOption.dataset.comp = component;

  const divIcon = document.createElement("div");
  divIcon.className = "side-menu-icon";
  const i = document.createElement("i");
  i.className = icon;
  divIcon.appendChild(i);

  const label = document.createElement("p");
  label.className = "texto";
  label.textContent = text;

  divOption.append(divIcon, label);
  divOption.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-option").forEach((opt) => {
      opt.classList.remove("active");
    });
    divOption.classList.add("active");
    loadComponent(component);
    console.log(component);
  });

  return divOption;
}

function addLogoutButton() {
  const logoutBtn = document.createElement("div");
  logoutBtn.className = "sidebar-option logout-option";

  const logoutIcon = document.createElement("div");
  logoutIcon.className = "side-menu-icon";
  const i = document.createElement("i");
  i.className = "fa-solid fa-right-from-bracket";
  logoutIcon.appendChild(i);

  const logoutLabel = document.createElement("p");
  logoutLabel.className = "texto";
  logoutLabel.textContent = "Logout";

  logoutBtn.append(logoutIcon, logoutLabel);

  logoutBtn.addEventListener("click", () => {
    console.log("Logging out...");
    localStorage.clear();
    location.href = "/screens/login/login.html";
  });

  sideMenu.appendChild(logoutBtn);
}

async function loadComponent(component) {
  const htmlUrl = `./${screens}/${component}/${component}.html`;
  const moduleUrl = `${screens}/${component}/code.js?t=${Date.now()}`;

  const html = await fetch(htmlUrl).then((r) => r.text());
  document.getElementById("content").innerHTML = html;

  const { init } = await import(moduleUrl);
  if (typeof init === "function") init();
}
