const config = (label) => ({
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: label,
            data: [],
            borderColor: 'rgba(0, 123, 255, 1)',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { display: false },
            y: { beginAtZero: false }
        }
    }
});

const charts = {
    temp: new Chart(document.getElementById('chartTemp'), config('Temperatura')),
    hum: new Chart(document.getElementById('chartHum'), config('Humedad')),
    luz: new Chart(document.getElementById('chartLuz'), config('Luz')),
    presion: new Chart(document.getElementById('chartPresion'), config('Presión')),
    sonido: new Chart(document.getElementById('chartSonido'), config('Sonido'))
};

function actualizarDatos() {
    fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            actualizarGrafico(charts.temp, data.temperatura);
            actualizarGrafico(charts.hum, data.humedad);
            actualizarGrafico(charts.luz, data.luz);
            actualizarGrafico(charts.presion, data.presion);
            actualizarGrafico(charts.sonido, data.sonido);
        })
        .catch(error => console.error('Error al obtener datos:', error));
}

function actualizarGrafico(chart, nuevoValor) {
    const maxDataPoints = 10;
    if (chart.data.labels.length >= maxDataPoints) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.data.labels.push('');
    chart.data.datasets[0].data.push(nuevoValor);
    chart.update();
}

setInterval(actualizarDatos, 2000);