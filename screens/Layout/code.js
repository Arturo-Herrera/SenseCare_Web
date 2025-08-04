import { getDeviceData } from "./services.js";

// Mapa y marcador rojo
let map;
let redMarker = null;

// Arreglo para manejar parpadeo
let markers = [];
let blinkInterval = null;

// Configuración central y zoom del mapa
const centerCoords = { lat: 32.4645, lng: -116.828 };
const zoomLevel = 11.5;

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

  setInterval(renderAllPatients, 120000); // ✅ Corregido: removí los paréntesis extra
}

function isRecent(fechaISO) {
  const fechaAlerta = new Date(fechaISO);
  const ahora = new Date();
  const diferenciaMin = (ahora - fechaAlerta) / (1000 * 60);
  return diferenciaMin <= 10;
}

// Función para determinar el color según el tipo de alerta
function getAlertColor(tipoAlerta) {
  // Convierte a mayúsculas para comparación más robusta
  const tipo = String(tipoAlerta).toUpperCase();
  
  switch (tipo) {
    case 'SOS':
      return '#ea4335'; // Rojo para SOS
    case 'WARN':
    case 'WARNING':
      return '#fbbc04'; // Amarillo para WARN/WARNING
    default:
      return '#34a853'; // Verde para otros tipos
  }
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

function createImageIcon(url, borderColor = "#ffffff") {
  const canvas = document.createElement("canvas");
  canvas.width = 60;
  canvas.height = 60;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;

  return new Promise((resolve) => {
    img.onload = () => {
      // Borde exterior
      ctx.beginPath();
      ctx.arc(30, 30, 28, 0, Math.PI * 2, true);
      ctx.fillStyle = borderColor;
      ctx.fill();

      // Clip redondo para la imagen
      ctx.save();
      ctx.beginPath();
      ctx.arc(30, 30, 24, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Imagen dentro del círculo
      ctx.drawImage(img, 6, 6, 48, 48);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/png") + `#${Math.random()}`; // Forzar cambio
      resolve({
        url: dataUrl,
        scaledSize: new google.maps.Size(50, 50),
        anchor: new google.maps.Point(25, 25),
      });
    };

    img.onerror = () => {
      resolve({
        url,
        scaledSize: new google.maps.Size(50, 50),
        anchor: new google.maps.Point(25, 25),
      });
    };
  });
}

async function renderAllPatients() {
  try {
    const response = await getDeviceData();
    const patients = response.data;

    // Limpiar marcadores anteriores
    markers.forEach(markerObj => {
      if (markerObj.marker) {
        markerObj.marker.setMap(null);
      }
    });
    markers = [];

    // Limpiar intervalo de parpadeo anterior
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }

    const defaultImageUrl =
      "https://res.cloudinary.com/drrbpmn8j/image/upload/v1754318789/ttiwc7chvzoqo0o3ahwb.png";

    for (const p of patients) {
      const alerta = p.alerta;
      if (!alerta || !alerta.fecha) continue;

      const lat = parseFloat(p.latitud);
      const lng = parseFloat(p.longitud);
      if (isNaN(lat) || isNaN(lng)) continue;

      const fotoUrl =
        p.foto && p.foto.startsWith("http") ? p.foto : defaultImageUrl;

      // ✅ Color según tipo de alerta (SOS = amarillo, WARNING = rojo)
      const color = getAlertColor(alerta.idTipoAlerta);
      const parpadea = isRecent(alerta.fecha);

      const icon = await createImageIcon(fotoUrl, color);

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
        parpadea,
        strokeToggle: false,
        baseColor: color,
        fotoUrl,
        fechaAlerta: alerta.fecha,
        tipoAlerta: alerta.idTipoAlerta
      });
    }

    // ✅ Iniciar parpadeo solo si hay marcadores que deban parpadear
    const hasBlinkingMarkers = markers.some(m => m.parpadea);
    if (hasBlinkingMarkers) {
      startBlinking();
    }

  } catch (err) {
    console.error("Error al pintar pacientes en el mapa:", err);
  }
}

// ✅ Función separada para manejar el parpadeo
function startBlinking() {
  blinkInterval = setInterval(async () => {
    const ahora = new Date();
    let stillBlinking = false;

    for (const obj of markers) {
      if (obj.parpadea) {
        const tiempoAlerta = new Date(obj.fechaAlerta);
        const minutosDesdeAlerta = (ahora - tiempoAlerta) / (1000 * 60);

        // Solo parpadea durante los primeros 10 minutos
        if (minutosDesdeAlerta <= 10) {
          stillBlinking = true;
          obj.strokeToggle = !obj.strokeToggle;

          // Color de parpadeo: alterna entre el color base y gris claro
          const colorParpadeo = obj.strokeToggle ? obj.baseColor : "#cccccc";

          const newIcon = await createImageIcon(obj.fotoUrl, colorParpadeo);
          obj.marker.setIcon(newIcon);
        } else {
          // Después de 10 minutos, deja de parpadear y mantiene el color base
          obj.parpadea = false;
          const staticIcon = await createImageIcon(obj.fotoUrl, obj.baseColor);
          obj.marker.setIcon(staticIcon);
        }
      }
    }

    // Si no hay más marcadores parpadeando, detener el intervalo
    if (!stillBlinking) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }
  }, 600); // Parpadea cada 600ms
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