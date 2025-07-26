import { getPatientData, selectPatient } from "./services.js";

function renderPatientData(idPatient) {
  getPatientData(idPatient).then((data) => {
    console.log("Datos recibidos:", data); // Para debug
    
    // La estructura de datos muestra que patient es un array
    // y necesitamos acceder al primer elemento y luego a la propiedad 'paciente'
    if (data.patient && data.patient.length > 0) {
      const patientData = data.patient[0].paciente; // Accedemos al objeto paciente dentro del array
      renderInfoPatient(patientData);
      updateDashboard(data);
      // También renderizar las otras secciones si las tienes
      if (data.lectures && data.lectures.length > 0) {
        renderLectures(data.lectures);
      }
      
      if (data.alerts && data.alerts.length > 0) {
        renderAlerts(data.alerts);
      }
    } else {
      console.error("No patient data found");
    }
  }).catch((error) => {
    console.error("Error fetching patient data:", error);
  });
}

function renderInfoPatient(data) {
    console.log("Datos del paciente:", data); // Para debug

    // Renderizar nombre completo
    const fullName = `${data.nombre || ''} ${data.apellidoPa || ''} ${data.apellidoMa || ''}`.trim();
    document.getElementById("name").textContent = fullName || "Usuario desconocido";

    // Renderizar género
    document.getElementById("gender").textContent = data.sexo || "No especificado";

    // Calcular y renderizar edad
    if (data.fecNac) {
        const birthDate = new Date(data.fecNac);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Ajustar la edad si aún no ha pasado el cumpleaños este año
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        document.getElementById("age").textContent = `${age} años`;
    } else {
        document.getElementById("age").textContent = "Edad no disponible";
    }

    // Ocultar el elemento de última lectura
    const lectureElement = document.getElementById("lecture");
    if (lectureElement) {
        lectureElement.style.display = "none";
    }
}

function renderLectures(lectures) {
    // Obtener las últimas 3 lecturas
    const recentLectures = lectures.slice(0, 3);
    const lectureCards = document.querySelectorAll('.lecture-card');
    
    recentLectures.forEach((lecture, index) => {
        if (lectureCards[index]) {
            const card = lectureCards[index];
            const stats = card.querySelectorAll('.stat p');
            
            // Actualizar BPM (pulso promedio)
            if (stats[0]) {
                stats[0].textContent = `${lecture.pulsoPromedio || 'N/A'} BPM`;
            }
            
            // Actualizar temperatura
            if (stats[1]) {
                stats[1].textContent = `${lecture.temperatura || 'N/A'} °C`;
            }
            
            // Actualizar oxígeno
            if (stats[2]) {
                stats[2].textContent = `${lecture.oxigeno || 'N/A'} %`;
            }
        }
    });
    
    // Actualizar "Last lecture" con la más reciente
    if (lectures.length > 0) {
        // Ya no actualizamos el elemento lecture porque está oculto
        console.log("Última lectura disponible pero no se muestra en el perfil");
    }
}//! GRAFICA

function renderAlerts(alerts) {
    const alertsContainer = document.querySelector('.cards-alerts-container');
    if (!alertsContainer) return;
    
    // Limpiar alertas existentes
    alertsContainer.innerHTML = '';
    
    // Tomar solo las últimas 6 alertas
    const recentAlerts = alerts.slice(0, 6);
    
    recentAlerts.forEach(alert => {
        const alertCard = document.createElement('div');
        alertCard.className = 'card card-warning'; // Puedes cambiar esto según el tipo de alerta
        
        alertCard.innerHTML = `
            <div class="description-alert">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p class="description">${alert.signoAfectado}</p>
            </div>
            <div class="time-alert">
                <p class="time-ago">${formatTimeAgo(alert.timeAgo)}</p>
            </div>
        `;
        
        alertsContainer.appendChild(alertCard);
    });
}

function formatTimeAgo(minutes) {
    if (minutes < 60) {
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else if (minutes < 1440) { // menos de 24 horas
        const hours = Math.floor(minutes / 60);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(minutes / 1440);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}

// Código del selector de pacientes (sin cambios)
selectPatient().then((response) => {
  const patients = Array.isArray(response) ? response : response.data;

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

  select.addEventListener("change", (e) => {
    const idPatient = e.target.value;
    if (idPatient) {
        renderPatientData(idPatient);
    } else {
        // Limpiar los datos cuando no hay paciente seleccionado
        document.getElementById("name").textContent = "Selecciona un paciente";
        document.getElementById("gender").textContent = "";
        document.getElementById("age").textContent = "";
    }
  });

  console.log(patients);

}).catch((error) => {
  console.error("Error fetching patients:", error);
});


function updateDashboard(data) {
    const vitals = data.averageVitals;

    const categories = vitals.map(v => {
        const dateObj = new Date(v.date);
        return dateObj.toISOString().split('T')[0]; // yyyy-MM-dd
    });

    const tempData = vitals.map(v => v.averageTemperature);
    const bpmData = vitals.map(v => v.averagePulse);
    const oxygenData = vitals.map(v => v.averageOxygen);

    Highcharts.chart('chart-data', {
        chart: {
            type: 'spline',
            backgroundColor: 'transparent',
            spacing: [10, 0, 10, 0]
        },
        title: { text: '' },
        xAxis: {
            categories: categories,
            lineColor: '#ccc',
            tickColor: '#ccc'
        },
        yAxis: {
            title: { text: '' },
            gridLineColor: '#f5f5f5'
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            spline: {
                marker: { enabled: true, radius: 4 },
                lineWidth: 2,
                enableMouseTracking: false,
                dataLabels: {
                    enabled: true,
                    style: { fontSize: '10px', color: '#444' }
                }
            }
        },
        series: [
            {
                name: 'Temp',
                data: tempData,
                color: '#ffb6c1',
                marker: { fillColor: '#ffb6c1' }
            },
            {
                name: 'BPM',
                data: bpmData,
                color: '#90ee90',
                marker: { fillColor: '#90ee90' }
            },
            {
                name: 'Oxygen',
                data: oxygenData,
                color: '#9EB3FD',
                marker: { fillColor: '#9EB3FD' }
            }
        ]
    });
}
