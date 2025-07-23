//* This is used to assign the URL from menu.json
const menu = "../json/menu.json";

//* This is used to assign the URL from each screen path
const screens = "../screens/";

//? Variables to access to the html elements
const sideMenu = document.getElementById("menu");
const content = document.getElementById("content");

//! This variable allows you to reuse the structure of options in multiple functions without requesting it again
let menuData;

//? We call function init
init();

//? This function initializes the sidebar menu and loads the correct screen.
//! 1. It first tries to fetch the menu data from a JSON file.
//! 2. If it fails, it logs the error and shows a message in the content area.
//! 3. If successful, it builds the sidebar by adding each menu option.
//! 4. Then it checks the URL hash to decide which screen to load first.
//! - If there's no hash, it loads the first option from the menu.
//! 5. It also sets up a listener for browser navigation,
//!    so when the user goes back or forward, it reloads the corresponding screen.

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

  const firstView = location.hash.slice(1) || menuData.options[0].component;
  await loadComponent(firstView);

  window.addEventListener("popstate", (e) =>
    loadComponent(e.state?.component || menuData.options[0].component)
  );
}

//? This function creates and returns one sidebar button and connect its click to load the corresponding screen.

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
    // Poner active solo a la opción clickeada
    divOption.classList.add("active");
    loadComponent(component);
    console.log(component);
  });

  return divOption;
}

//? This function loads and displays the selected screen inside the main content area.
//! 1. It builds the path to the html file based on the component name.
//! 2. It fetches the html and inserts it into the page.
//! 3. If there's an error, it shows an error message instead.
//! 4. Then it updates the sidebar to highlight the active menu option.
//! 5. Finally, it updates the browser's URL using pushState to reflect the current view.

async function loadComponent(component) {
  const htmlUrl = `./${screens}/${component}/${component}.html`;
  const moduleUrl = `${screens}/${component}/code.js`;

  const html = await fetch(htmlUrl).then((r) => r.text());
  document.getElementById("content").innerHTML = html;

  const { init } = await import(moduleUrl);
  if (typeof init === "function") init();
}
