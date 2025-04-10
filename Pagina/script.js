let tempData = [], humData = [], co2Data = [], soundData = [], lightData = [];
let labels = [];

const createChart = (ctx, label, color, minValue, maxValue) => {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                backgroundColor: color + '22',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                x: { display: false },
                y: {
                    beginAtZero: true,
                    min: minValue,
                    max: maxValue,
                    ticks: {
                        stepSize: Math.round((maxValue - minValue) / 5)
                    }
                }
            }
        }
    });
};

// gráficos
const tempChart = createChart(document.getElementById('tempChart'), 'Temperatura (°C)', '#e57373', 0, 40);
const humChart = createChart(document.getElementById('humChart'), 'Humedad (%)', '#64b5f6', 0, 100);
const co2Chart = createChart(document.getElementById('co2Chart'), 'CO2 (ppm)', '#81c784', 0, 2000);
const soundChart = createChart(document.getElementById('soundChart'), 'Sonido (dB)', '#ba68c8', 0, 80);
const lightChart = createChart(document.getElementById('lightChart'), 'Luz (Lux)', '#ffd54f', 0, 350);

function updateChart(chart, dataArray, value, minValue, maxValue) {
    const time = new Date().toLocaleTimeString();
    if (labels.length >= 20) {
        labels.shift();
        dataArray.shift();
    }
    labels.push(time);
    dataArray.push(value);
    chart.data.labels = [...labels];
    chart.data.datasets[0].data = [...dataArray];
    chart.options.scales.y.min = minValue;
    chart.options.scales.y.max = maxValue;
    chart.update();
}

async function fetchSensorData() {
    try {
        const response = await fetch('guardar_datos.php');
        const data = await response.json();

        document.getElementById('update-time').textContent = data.fecha || 'Nunca';

        if (data.status === "OK") {
            const t = parseFloat(data.temperatura);
            const h = parseFloat(data.humedad);
            const c = parseFloat(data.co2);
            const s = parseFloat(data.sonido);
            const l = parseFloat(data.luz);

            document.getElementById('temperature').textContent = t || '--';
            document.getElementById('humidity').textContent = h || '--';
            document.getElementById('co2').textContent = c || '--';
            document.getElementById('sound').textContent = s || '--';
            document.getElementById('light').textContent = l || '--';

            updateChart(tempChart, tempData, t, parseInt(document.getElementById('temp-min').value), parseInt(document.getElementById('temp-max').value));
            updateChart(humChart, humData, h, parseInt(document.getElementById('hum-min').value), parseInt(document.getElementById('hum-max').value));
            updateChart(co2Chart, co2Data, c, parseInt(document.getElementById('co2-min').value), parseInt(document.getElementById('co2-max').value));
            updateChart(soundChart, soundData, s, parseInt(document.getElementById('sound-min').value), parseInt(document.getElementById('sound-max').value));
            updateChart(lightChart, lightData, l, parseInt(document.getElementById('light-min').value), parseInt(document.getElementById('light-max').value));
        } else {
            console.error("Error del servidor:", data.mensaje);
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
        document.getElementById('update-time').textContent = "Error al conectar";
    }
}

setInterval(fetchSensorData, 2000);
fetchSensorData();
