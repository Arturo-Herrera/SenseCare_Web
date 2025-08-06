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
  setInterval(renderAllPatients, 10000);
}

function initializeMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  map = new google.maps.Map(mapElement, {
    zoom: zoomLevel,
    center: centerCoords,
  });

  renderAllPatients();
  setInterval(renderAllPatients, 10000);
}

function isRecent(fechaISO) {
  const fechaAlertaUTC = new Date(fechaISO);
  const fechaAlertaMexico = new Date(fechaAlertaUTC.getTime() - (7 * 60 * 60 * 1000));
  
  const ahoraUTC = new Date();
  const ahoraMexico = new Date(ahoraUTC.getTime() - (7 * 60 * 60 * 1000));
  
  const diferenciaMin = (ahoraMexico - fechaAlertaMexico) / (1000 * 60);
  
  return diferenciaMin <= 10 && diferenciaMin >= 0;
}

// Función para determinar el color según el tipo de alerta
function getAlertColor(tipoAlerta) {
  const tipo = String(tipoAlerta).toUpperCase();
  
  switch (tipo) {
    case 'SOS':
      return '#ea4335';
    case 'WARN':
    case 'WARNING':
      return '#fbbc04';
    default:
      return '#34a853';
  }
}

// Función para determinar el color del contorno (verde si no es reciente)
function getContourColor(tipoAlerta, isRecent) {
  if (!isRecent) {
    return '#34a853'; // Verde fijo para alertas no recientes
  }
  return getAlertColor(tipoAlerta); // Color original para alertas recientes
}

function createImageIcon(url, borderColor = "#ffffff", isAlert = false) {
  // Tamaño más grande para alertas
const size = isAlert ? 85 : 60;
const radius = isAlert ? 40.5 : 28;
const innerRadius = isAlert ? 34 : 24;
const imageSize = isAlert ? 68 : 48;
const imageOffset = isAlert ? 8.5 : 6;
const scaledSize = isAlert ? 70 : 50;
const anchorPoint = isAlert ? 35 : 25;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;

  return new Promise((resolve) => {
    img.onload = () => {
      // Borde exterior con el color correspondiente
      ctx.beginPath();
      ctx.arc(size/2, size/2, radius, 0, Math.PI * 2, true);
      ctx.fillStyle = borderColor;
      ctx.fill();

      // Clip redondo para la imagen
      ctx.save();
      ctx.beginPath();
      ctx.arc(size/2, size/2, innerRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Imagen dentro del círculo
      ctx.drawImage(img, imageOffset, imageOffset, imageSize, imageSize);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/png") + `#${Math.random()}`;
      resolve({
        url: dataUrl,
        scaledSize: new google.maps.Size(scaledSize, scaledSize),
        anchor: new google.maps.Point(anchorPoint, anchorPoint),
      });
    };

    img.onerror = () => {
      resolve({
        url,
        scaledSize: new google.maps.Size(scaledSize, scaledSize),
        anchor: new google.maps.Point(anchorPoint, anchorPoint),
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
      const lat = parseFloat(p.latitud);
      const lng = parseFloat(p.longitud);
      if (isNaN(lat) || isNaN(lng)) continue;

      const fotoUrl =
        p.foto && p.foto.startsWith("http") ? p.foto : defaultImageUrl;

      let alertColor, contourColor, isAlertRecent, alertText, alertTextColor, shouldBeLarge;

      if (!alerta || !alerta.fecha || !alerta.idTipoAlerta) {
        // Sin alertas
        contourColor = '#34a853';
        isAlertRecent = false;
        alertText = 'Sin alertas';
        alertTextColor = '#34a853';
        shouldBeLarge = false; // Tamaño normal
      } else {
        // Con alertas
        isAlertRecent = isRecent(alerta.fecha);
        alertColor = getAlertColor(alerta.idTipoAlerta);
        contourColor = getContourColor(alerta.idTipoAlerta, isAlertRecent);
        alertText = alerta.idTipoAlerta;
        alertTextColor = alertColor;
        shouldBeLarge = isAlertRecent; // Solo grande si es reciente
      }

      const icon = await createImageIcon(fotoUrl, contourColor, shouldBeLarge);

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
          <p style="margin: 4px 0;"><strong>Signo Afectado:</strong> ${alerta ? alerta.signoAfectado : 'N/A'}</p>
          <p style="margin: 4px 0; color: ${alertTextColor};">
            <strong>Tipo de Alerta:</strong> ${alertText}
          </p>
        </div>
      `;

      const infowindow = new google.maps.InfoWindow({ content });

      marker.addListener("click", () => {
        infowindow.open(map, marker);
      });

      markers.push({
        marker,
        parpadea: isAlertRecent,
        strokeToggle: false,
        baseColor: contourColor,
        fotoUrl,
        fechaAlerta: alerta ? alerta.fecha : null,
        tipoAlerta: alerta ? alerta.idTipoAlerta : null,
        shouldBeLarge: shouldBeLarge
      });
    }

    // Iniciar parpadeo solo si hay marcadores que deban parpadear
    const hasBlinkingMarkers = markers.some(m => m.parpadea);
    if (hasBlinkingMarkers) {
      startBlinking();
    }

  } catch (err) {
    console.error("Error al pintar pacientes en el mapa:", err);
  }
}

function startBlinking() {
  blinkInterval = setInterval(async () => {
    const ahoraUTC = new Date();
    const ahoraMexico = new Date(ahoraUTC.getTime() - (7 * 60 * 60 * 1000));
    let stillBlinking = false;

    for (const obj of markers) {
      if (obj.parpadea && obj.fechaAlerta) {
        const tiempoAlertaUTC = new Date(obj.fechaAlerta);
        const tiempoAlertaMexico = new Date(tiempoAlertaUTC.getTime() - (7 * 60 * 60 * 1000));
        const minutosDesdeAlerta = (ahoraMexico - tiempoAlertaMexico) / (1000 * 60);

        if (minutosDesdeAlerta <= 10 && minutosDesdeAlerta >= 0) {
          stillBlinking = true;
          obj.strokeToggle = !obj.strokeToggle;

          const colorParpadeo = obj.strokeToggle ? obj.baseColor : "#e0e0e0";
          const newIcon = await createImageIcon(obj.fotoUrl, colorParpadeo, true); // Grande mientras parpadea
          obj.marker.setIcon(newIcon);
        } else {
          // Después de 10 minutos: deja de parpadear, se vuelve verde y PEQUEÑO
          obj.parpadea = false;
          obj.shouldBeLarge = false; // Cambiar a pequeño
          obj.baseColor = '#34a853'; // Verde fijo
          const staticIcon = await createImageIcon(obj.fotoUrl, '#34a853', false); // Pequeño
          obj.marker.setIcon(staticIcon);
        }
      }
    }

    if (!stillBlinking) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }
  }, 600);
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