import { getDeviceData } from "./services.js";

// Mapa y marcador rojo
let map;
let redMarker = null;

// Arreglo para manejar parpadeo
let markers = [];

// Configuración central y zoom del mapa
const centerCoords = { lat: 32.4645, lng: -116.828 };
const zoomLevel = 11;

export function init() {
  if (window.google && window.google.maps && window.google.maps.Map) {
    initializeMap();
  } else {
    loadGoogleMapsWithBootstrap();
  }
}

function loadGoogleMapsWithBootstrap() {
  if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

  const bootstrapCode = `
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({key: "AIzaSyB3FVF1njQEtL3RVS4UthYcUHCCqLbkQig",v: "weekly"});
  `;

  const script = document.createElement("script");
  script.textContent = bootstrapCode;
  document.head.appendChild(script);

  const checkGoogleMaps = setInterval(() => {
    if (
      window.google &&
      window.google.maps &&
      window.google.maps.importLibrary
    ) {
      clearInterval(checkGoogleMaps);
      initializeMapWithImportLibrary();
    }
  }, 100);

  setTimeout(() => clearInterval(checkGoogleMaps), 10000);
}

async function initializeMapWithImportLibrary() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(mapElement, {
    zoom: zoomLevel,
    center: centerCoords,
  });

  await renderAllPatients();

  setInterval(renderAllPatients, 120000);
}

function initializeMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  map = new google.maps.Map(mapElement, {
    zoom: zoomLevel,
    center: centerCoords,
  });

  renderAllPatients();

  setInterval(renderAllPatients(), 120000);
}

function isRecent(fechaISO) {
  const fechaAlerta = new Date(fechaISO);
  const ahora = new Date();
  const diferenciaMin = (ahora - fechaAlerta) / (1000 * 60);
  return diferenciaMin <= 10;
}

// Ícono con color invertible
function createEmojiIcon(emoji, color, invert = false) {
  const fillColor = invert ? "#ffffff" : color;
  const strokeColor = invert ? color : "#ffffff";
  const textColor = invert ? color : "#ffffff";

  return {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <circle cx="30" cy="30" r="28" fill="${fillColor}" stroke="${strokeColor}" stroke-width="4" filter="url(#shadow)"/>
        <text x="30" y="38" text-anchor="middle" font-size="28" font-family="Arial" fill="${textColor}">${emoji}</text>
      </svg>
    `),
    scaledSize: new google.maps.Size(50, 50),
    anchor: new google.maps.Point(25, 25),
  };
}

// Renderizar pacientes
async function renderAllPatients() {
  try {
    const response = await getDeviceData();
    const patients = response.data;

    markers = [];

    patients.forEach((p) => {
      const alerta = p.alerta;
      if (!alerta || !alerta.fecha || !alerta.idTipoAlerta) return;

      const lat = parseFloat(p.latitud);
      const lng = parseFloat(p.longitud);
      if (isNaN(lat) || isNaN(lng)) return;

      const emoji = p.sexo === "Femenino" ? "👩🏼‍💼" : "👨🏼‍💼";
      const isAlertRecent = isRecent(alerta.fecha);

      let color, parpadea;

      if (alerta.idTipoAlerta === "SOS") {
        color = "#ea4335";
        parpadea = true;
      } else if (isAlertRecent) {
        color = "#fbbc04";
        parpadea = true;
      } else {
        color = "#9e9e9e";
        parpadea = false;
      }

      const icon = createEmojiIcon(emoji, color, false);

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: p.nombreCompleto,
        icon,
      });

      const content = `
        <div style="
          font-family: Arial, sans-serif;
          padding: 12px;
          max-width: 220px;
          background: #fff;
        ">
          <h3 style="margin: 0 0 8px 0; color: #333;">${p.nombreCompleto}</h3>
          <p style="margin: 4px 0;"><strong>Sexo:</strong> ${p.sexo}</p>
          <p style="margin: 4px 0;"><strong>Signo Afectado:</strong> ${alerta.signoAfectado}</p>
          <p style="margin: 4px 0; color: ${color};">
            <strong>Tipo de Alerta:</strong> ${alerta.idTipoAlerta}
          </p>
        </div>
      `;

      const infowindow = new google.maps.InfoWindow({ content });

      marker.addListener("click", () => {
        infowindow.open(map, marker);
      });

      markers.push({
        marker,
        emoji,
        parpadea,
        tipoAlerta: alerta.idTipoAlerta,
        strokeToggle: false,
        baseColor: color,
      });
    });

    setInterval(() => {
      markers.forEach((obj) => {
        if (obj.parpadea) {
          obj.strokeToggle = !obj.strokeToggle;

          const newIcon = createEmojiIcon(
            obj.emoji,
            obj.baseColor,
            obj.strokeToggle
          );
          obj.marker.setIcon(newIcon);
        }
      });
    }, 600);
  } catch (err) {
    console.error("Error al pintar pacientes en el mapa:", err);
  }
}

// Marcador rojo manual
function setRedMarker(lat, lng, title = "Paciente") {
  if (!map) return;
  if (redMarker) redMarker.setMap(null);

  redMarker = new google.maps.Marker({
    position: { lat, lng },
    map,
    title,
    icon: createEmojiIcon("❗", "#ea4335"),
    zIndex: 1000,
  });
}

window.setRedPersonLocation = function (lat, lng, name) {
  setRedMarker(lat, lng, name || "Paciente");
};
