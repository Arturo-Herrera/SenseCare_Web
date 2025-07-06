/* js/menu.js
   Genera el menú lateral leyendo /data/menu.json
   Funciona en FA 6 (usa "fa-solid") y muestra fallback si falla el fetch.
*/
(() => {
  const MENU_JSON_PATH = '../json/menu.json';

  async function buildSidebar() {
    const menu = document.getElementById('menu');
    if (!menu) {
      console.error('No se encontró #menu en el DOM');
      return;
    }

    let items;
    try {
      const res = await fetch(MENU_JSON_PATH);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      items = await res.json();
    } catch (err) {
      console.warn('No pude cargar menu.json; usando fallback:', err);
      items = [
        { icon: 'fa-solid fa-chart-bar', text: 'Dashboard', href: '#' },
        { icon: 'fa-solid fa-user', text: 'Patients', href: '#' },
        { icon: 'fa-solid fa-file-medical', text: 'Medical history', href: '#' },
        { icon: 'fa-solid fa-users', text: 'Users', href: '#' },
        { icon: 'fa-solid fa-cog', text: 'Settings', href: '#' }
      ];
    }

    menu.innerHTML = ''; // limpia por si acaso

    items.forEach(({ icon, text, href }) => {
      const option = document.createElement('div');
      option.className = 'sidebar-option';

      const iconEl = document.createElement('i');
      iconEl.className = icon; // p. ej. "fa-solid fa-user"

      const label = document.createElement('p');
      label.className = 'texto';
      label.textContent = text;

      option.append(iconEl, label);

      if (href) {
        option.style.cursor = 'pointer';
        option.addEventListener('click', () => (window.location.href = href));
      }

      menu.appendChild(option);
    });
  }

  document.addEventListener('DOMContentLoaded', buildSidebar);
})();
