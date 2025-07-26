import { getDashboardData } from "./services.js";


getDashboardData().then((data) => {
  console.log(data);

  document.getElementById("active-patients").textContent =
    data.data.activePatients.pacientesActivos;

    document.getElementById("avg-alerts-per-day").textContent =
    data.data.alertsPerDay.totalAlertas || 0;

    document.getElementById("avg-oxygen-level").textContent =
    data.data.oxygenLevel.promedioOxigeno + "%" || "N/A";

    updateDashboard(data);
});


function updateDashboard(data) {
    // Extrae los datos de averageVitals
    const vitals = data.data.averageVitals;

    // Prepara los arrays para la gráfica
    const categories = vitals.map(v => v.fecha);
    const tempData = vitals.map(v => v.promedioTemperatura);
    const bpmData = vitals.map(v => v.promedioPulso);

    // Renderiza el gráfico
    Highcharts.chart('chart-data', {
        chart: {
            type: 'spline',
            backgroundColor: 'transparent'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: categories,
            lineColor: '#ccc',
            tickColor: '#ccc'
        },
        yAxis: {
            title: { text: '' },
            gridLineColor: '#eee'
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'horizontal',
            symbolRadius: 0
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
                name: 'BPM',
                data: bpmData,
                color: '#90EE90',
                showInLegend: false,
                marker: {
                  enabled: true,
                  radius: 6,
                  symbol: 'circle',
                  lineColor: '#90EE90',
                  lineWidth: 3,
                  fillColor: '#90EE90'
                }
            },
            {
                name: 'Temp',
                data: tempData,
                color: '#FFB6C1',
                showInLegend: false,
                marker: { 
                  enabled: true,
                  radius: 6,
                  symbol: 'circle',
                  lineColor: '#FFB6C1',
                  lineWidth: 3,
                  fillColor: '#FFB6C1'
                }
            }
        ]
    });
}
