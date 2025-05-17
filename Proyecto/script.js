let tempData = [], humData = [], co2Data = [], soundData = [], lightData = [];
let tempLabels = [], humLabels = [], co2Labels = [], soundLabels = [], lightLabels = [];
let darkMode = localStorage.getItem('darkMode') === 'true';
let historicalCombinedChart; 

Chart.defaults.color = '#adb5bd';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
Chart.defaults.font.size = 12;

document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#start-date", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        locale: "es",
        defaultDate: new Date(Date.now() - 86400000) 
    });

    flatpickr("#end-date", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        locale: "es",
        defaultDate: new Date()
    });

    document.getElementById('real-time-section').style.display = 'block';
    document.getElementById('historical-section').style.display = 'none';
    
    initCharts();
    
    setupEventListeners();
    
    startRealTimeUpdates();
    
    applyDarkMode();
});

function initCharts() {
    window.tempChart = createChart('tempChart', 'Temperatura (°C)', '#4dabf7', 0, 40);
    window.humChart = createChart('humChart', 'Humedad (%)', '#20c997', 0, 100);
    window.co2Chart = createChart('co2Chart', 'CO2 (ppm)', '#fd7e14', 0, 2000);
    window.soundChart = createChart('soundChart', 'Sonido (dB)', '#d63384', 0, 80);
    window.lightChart = createChart('lightChart', 'Luz (Lux)', '#ffc107', 0, 350);
    
    historicalCombinedChart = createCombinedHistoricalChart();
}

function createChart(elementId, label, color, minValue, maxValue) {
    const ctx = document.getElementById(elementId).getContext('2d');
    const textColor = darkMode ? '#e0e0e0' : '#666';
    const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const bgColor = hexToRgba(color, darkMode ? 0.3 : 0.2);
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                backgroundColor: bgColor,
                fill: true,
                tension: 0.1,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            scales: {
                x: {
                    display: false,
                    grid: { 
                        display: false 
                    }
                },
                y: {
                    beginAtZero: minValue === 0,
                    min: minValue,
                    max: maxValue,
                    ticks: {
                        stepSize: Math.round((maxValue - minValue) / 5),
                        color: textColor
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    }
                }
            },
            plugins: {
                legend: { 
                    display: false 
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: darkMode ? 'rgba(50,50,50,0.9)' : 'rgba(0,0,0,0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 5,
                    titleFont: { 
                        size: 12,
                        weight: 'bold'
                    },
                    bodyFont: { 
                        size: 14 
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
                        }
                    }
                }
            },
            elements: {
                line: {
                    borderWidth: 2
                },
                point: {
                    radius: 3,
                    hoverRadius: 5,
                    backgroundColor: '#fff'
                }
            }
        }
    });
}

function createCombinedHistoricalChart() {
    const ctx = document.getElementById('historicalCombinedChart').getContext('2d');
    const textColor = darkMode ? '#e0e0e0' : '#666';
    const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperatura (°C)',
                    data: [],
                    borderColor: '#4dabf7',
                    backgroundColor: hexToRgba('#4dabf7', 0.2),
                    fill: false,
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Humedad (%)',
                    data: [],
                    borderColor: '#20c997',
                    backgroundColor: hexToRgba('#20c997', 0.2),
                    fill: false,
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 2,
                    yAxisID: 'y1'
                },
                {
                    label: 'CO2 (ppm)',
                    data: [],
                    borderColor: '#fd7e14',
                    backgroundColor: hexToRgba('#fd7e14', 0.2),
                    fill: false,
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 2,
                    yAxisID: 'y2'
                },
                {
                    label: 'Sonido (dB)',
                    data: [],
                    borderColor: '#d63384',
                    backgroundColor: hexToRgba('#d63384', 0.2),
                    fill: false,
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Luz (Lux)',
                    data: [],
                    borderColor: '#ffc107',
                    backgroundColor: hexToRgba('#ffc107', 0.2),
                    fill: false,
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { 
                        color: gridColor
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperatura (°C) / Sonido (dB)',
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humedad (%) / Luz (Lux)',
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: gridColor
                    }
                },
                y2: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'CO2 (ppm)',
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: gridColor
                    },
                    afterFit: function(axis) {
                        axis.paddingRight = 50;
                    }
                }
            },
            plugins: {
                legend: { 
                    display: true,
                    labels: {
                        color: textColor,
                        boxWidth: 12,
                        padding: 20,
                        font: {
                            size: 12
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: darkMode ? 'rgba(50,50,50,0.9)' : 'rgba(0,0,0,0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    cornerRadius: 5,
                    titleFont: { 
                        size: 12,
                        weight: 'bold'
                    },
                    bodyFont: { 
                        size: 14 
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
                        }
                    }
                }
            }
        }
    });
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function setupEventListeners() {
    document.getElementById('viewToggle').addEventListener('change', toggleViewMode);
    
    document.getElementById('filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });
    
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    
    document.getElementById('export-csv').addEventListener('click', exportToCSV);
    
   
    document.querySelectorAll('.chart-controls input').forEach(input => {
        input.addEventListener('change', updateChartRanges);
    });
    
   
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    
    
    document.getElementById('showTemp').addEventListener('change', toggleChartSeries);
    document.getElementById('showHum').addEventListener('change', toggleChartSeries);
    document.getElementById('showCo2').addEventListener('change', toggleChartSeries);
    document.getElementById('showSound').addEventListener('change', toggleChartSeries);
    document.getElementById('showLight').addEventListener('change', toggleChartSeries);
}

function toggleChartSeries() {
    if (!historicalCombinedChart) return;
    
    historicalCombinedChart.data.datasets[0].hidden = !document.getElementById('showTemp').checked;
    historicalCombinedChart.data.datasets[1].hidden = !document.getElementById('showHum').checked;
    historicalCombinedChart.data.datasets[2].hidden = !document.getElementById('showCo2').checked;
    historicalCombinedChart.data.datasets[3].hidden = !document.getElementById('showSound').checked;
    historicalCombinedChart.data.datasets[4].hidden = !document.getElementById('showLight').checked;
    
    historicalCombinedChart.update();
}

function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyDarkMode();
}

function applyDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (darkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
        document.querySelector('label[for="darkModeToggle"] i').className = 'bi bi-sun-fill';
    } else {
        document.body.classList.remove('dark-mode');
        darkModeToggle.checked = false;
        document.querySelector('label[for="darkModeToggle"] i').className = 'bi bi-moon-fill';
    }
    
    updateChartsTheme();
}

function updateChartsTheme() {
    const textColor = darkMode ? '#e0e0e0' : '#666';
    const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const tooltipBg = darkMode ? 'rgba(50,50,50,0.9)' : 'rgba(0,0,0,0.7)';
    
    const charts = [tempChart, humChart, co2Chart, soundChart, lightChart];
    
    charts.forEach(chart => {
        if (chart) {
            chart.options.scales.y.ticks.color = textColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.options.plugins.tooltip.backgroundColor = tooltipBg;
            
            chart.data.datasets.forEach(dataset => {
                const borderColor = dataset.borderColor;
                dataset.backgroundColor = hexToRgba(borderColor, darkMode ? 0.3 : 0.2);
            });
            
            chart.update();
        }
    });
    
    if (historicalCombinedChart) {
        historicalCombinedChart.options.scales.x.ticks.color = textColor;
        historicalCombinedChart.options.scales.x.grid.color = gridColor;
        historicalCombinedChart.options.scales.y.ticks.color = textColor;
        historicalCombinedChart.options.scales.y.grid.color = gridColor;
        historicalCombinedChart.options.scales.y.title.color = textColor;
        historicalCombinedChart.options.scales.y1.ticks.color = textColor;
        historicalCombinedChart.options.scales.y1.title.color = textColor;
        historicalCombinedChart.options.scales.y2.ticks.color = textColor;
        historicalCombinedChart.options.scales.y2.title.color = textColor;
        historicalCombinedChart.options.plugins.tooltip.backgroundColor = tooltipBg;
        historicalCombinedChart.options.plugins.legend.labels.color = textColor;
        
        historicalCombinedChart.update();
    }
}

function toggleViewMode() {
    const isHistorical = this.checked;
    document.getElementById('real-time-section').style.display = isHistorical ? 'none' : 'block';
    document.getElementById('historical-section').style.display = isHistorical ? 'block' : 'none';
    
    
    const label = document.querySelector('label[for="viewToggle"]');
    label.textContent = isHistorical ? 'Modo Tiempo Real' : 'Modo Histórico';
    
    if (isHistorical) {
        loadInitialHistoricalData();
    } else {
        tempData = []; humData = []; co2Data = []; soundData = []; lightData = [];
        tempLabels = []; humLabels = []; co2Labels = []; soundLabels = []; lightLabels = [];
    }
}

function startRealTimeUpdates() {
    setInterval(fetchSensorData, 2000);
    fetchSensorData();
}

async function fetchSensorData() {
    try {
        const response = await fetch('guardar_datos.php');
        const data = await response.json();

        if (data.fecha) {
            const date = new Date(data.fecha);
            document.getElementById('update-time').textContent = formatToSpanishDateTime(date);
        } else {
            document.getElementById('update-time').textContent = 'Nunca';
        }

        if (data.status === "OK") {
            updateSensorValues(data);
            updateCharts(data);
        } else {
            console.error("Error del servidor:", data.mensaje);
        }
    } catch (error) {
        console.error("Error al obtener datos:", error);
        document.getElementById('update-time').textContent = "Error al conectar";
    }
}

function formatToSpanishDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function updateSensorValues(data) {
    document.getElementById('temperature').textContent = data.temperatura ? parseFloat(data.temperatura).toFixed(1) : '--';
    document.getElementById('humidity').textContent = data.humedad ? parseFloat(data.humedad).toFixed(1) : '--';
    document.getElementById('co2').textContent = data.co2 ? parseFloat(data.co2).toFixed(1) : '--';
    document.getElementById('sound').textContent = data.sonido ? parseFloat(data.sonido).toFixed(1) : '--';
    document.getElementById('light').textContent = data.luz ? parseFloat(data.luz).toFixed(1) : '--';
}

function updateCharts(data) {
    const t = parseFloat(data.temperatura);
    const h = parseFloat(data.humedad);
    const c = parseFloat(data.co2);
    const s = parseFloat(data.sonido);
    const l = parseFloat(data.luz);

    if (!isNaN(t)) updateChart(tempChart, tempLabels, tempData, t,
        parseInt(document.getElementById('temp-min').value),
        parseInt(document.getElementById('temp-max').value));
    
    if (!isNaN(h)) updateChart(humChart, humLabels, humData, h,
        parseInt(document.getElementById('hum-min').value),
        parseInt(document.getElementById('hum-max').value));
    
    if (!isNaN(c)) updateChart(co2Chart, co2Labels, co2Data, c,
        parseInt(document.getElementById('co2-min').value),
        parseInt(document.getElementById('co2-max').value));
    
    if (!isNaN(s)) updateChart(soundChart, soundLabels, soundData, s,
        parseInt(document.getElementById('sound-min').value),
        parseInt(document.getElementById('sound-max').value));
    
    if (!isNaN(l)) updateChart(lightChart, lightLabels, lightData, l,
        parseInt(document.getElementById('light-min').value),
        parseInt(document.getElementById('light-max').value));
}

function updateChart(chart, labelsArray, dataArray, value, minValue, maxValue) {
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    if (labelsArray.length >= 20) {
        labelsArray.shift();
        dataArray.shift();
    }

    labelsArray.push(time);
    dataArray.push(value);

    chart.data.labels = [...labelsArray];
    chart.data.datasets[0].data = [...dataArray];
    chart.options.scales.y.min = minValue;
    chart.options.scales.y.max = maxValue;
    chart.update();
}

function updateChartRanges() {
    const charts = {
        tempChart: {chart: tempChart, min: 'temp-min', max: 'temp-max'},
        humChart: {chart: humChart, min: 'hum-min', max: 'hum-max'},
        co2Chart: {chart: co2Chart, min: 'co2-min', max: 'co2-max'},
        soundChart: {chart: soundChart, min: 'sound-min', max: 'sound-max'},
        lightChart: {chart: lightChart, min: 'light-min', max: 'light-max'}
    };

    for (const [id, config] of Object.entries(charts)) {
        const chart = config.chart;
        const min = parseInt(document.getElementById(config.min).value);
        const max = parseInt(document.getElementById(config.max).value);
        
        chart.options.scales.y.min = min;
        chart.options.scales.y.max = max;
        chart.options.scales.y.ticks.stepSize = Math.round((max - min) / 5);
        chart.update();
    }
}

async function applyFilters() {
    showLoading(true);
    
    const filters = {
        fecha_inicio: document.getElementById('start-date').value ? formatDateForDB(document.getElementById('start-date').value) : null,
        fecha_fin: document.getElementById('end-date').value ? formatDateForDB(document.getElementById('end-date').value) : null,
        temp_min: document.getElementById('min-temp').value || null,
        temp_max: document.getElementById('max-temp').value || null,
        hum_min: document.getElementById('min-hum').value || null,
        hum_max: document.getElementById('max-hum').value || null,
        co2_min: document.getElementById('min-co2').value || null,
        co2_max: document.getElementById('max-co2').value || null,
        sonido_min: document.getElementById('min-sound').value || null,
        sonido_max: document.getElementById('max-sound').value || null,
        luz_min: document.getElementById('min-light').value || null,
        luz_max: document.getElementById('max-light').value || null
    };

    
    if (filters.fecha_inicio && filters.fecha_fin && new Date(filters.fecha_inicio) > new Date(filters.fecha_fin)) {
        alert("La fecha de inicio no puede ser mayor que la fecha final");
        showLoading(false);
        return;
    }

    try {
        const response = await fetchHistoricalData(filters);
        updateHistoricalTable(response.datos);
    } catch (error) {
        console.error("Error al aplicar filtros:", error);
        alert("Error al aplicar filtros: " + error.message);
    } finally {
        showLoading(false);
    }
}

async function fetchHistoricalData(filters = {}) {
    const params = new URLSearchParams();
    for (const key in filters) {
        if (filters[key] !== null && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    }

    const response = await fetch(`obtener_historicos.php?${params.toString()}`);
    return await response.json();
}

function updateHistoricalTable(data) {
    const tableBody = document.querySelector('#historical-table tbody');
    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No se encontraron datos con los filtros aplicados</td></tr>';
        updateCombinedHistoricalChart([]);
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDateTime(row.fecha)}</td>
            <td>${row.temperatura ? parseFloat(row.temperatura).toFixed(1) : '-'}</td>
            <td>${row.humedad ? parseFloat(row.humedad).toFixed(1) : '-'}</td>
            <td>${row.co2 ? parseFloat(row.co2).toFixed(1) : '-'}</td>
            <td>${row.sonido ? parseFloat(row.sonido).toFixed(1) : '-'}</td>
            <td>${row.luz ? parseFloat(row.luz).toFixed(1) : '-'}</td>
        `;
        tableBody.appendChild(tr);
    });

    updateCombinedHistoricalChart(data);
}

function updateCombinedHistoricalChart(data) {
    if (!data || data.length === 0) {
        
        historicalCombinedChart.data.labels = [];
        historicalCombinedChart.data.datasets.forEach(dataset => {
            dataset.data = [];
        });
    } else {
        
        const labels = data.map(item => formatDateTimeShort(item.fecha));
        
        
        historicalCombinedChart.data.labels = labels;
        historicalCombinedChart.data.datasets[0].data = data.map(item => parseFloat(item.temperatura) || null);
        historicalCombinedChart.data.datasets[1].data = data.map(item => parseFloat(item.humedad) || null);
        historicalCombinedChart.data.datasets[2].data = data.map(item => parseFloat(item.co2) || null);
        historicalCombinedChart.data.datasets[3].data = data.map(item => parseFloat(item.sonido) || null);
        historicalCombinedChart.data.datasets[4].data = data.map(item => parseFloat(item.luz) || null);
    }

    historicalCombinedChart.update();
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    
    const date = new Date(dateTimeString);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    return date.toLocaleString('es-ES', options);
}

function formatDateTimeShort(dateTimeString) {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    
    return date.toLocaleString('es-ES', options);
}

function resetFilters() {
    document.getElementById('filter-form').reset();
    flatpickr("#start-date").setDate(new Date(Date.now() - 86400000));
    flatpickr("#end-date").setDate(new Date());
    loadInitialHistoricalData();
}

function loadInitialHistoricalData() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    
    fetchHistoricalData({
        fecha_inicio: yesterday.toISOString().slice(0, 19).replace('T', ' '),
        fecha_fin: now.toISOString().slice(0, 19).replace('T', ' ')
    }).then(data => {
        updateHistoricalTable(data.datos);
    });
}

function exportToCSV() {
    const rows = [['Fecha', 'Temperatura (°C)', 'Humedad (%)', 'CO2 (ppm)', 'Sonido (dB)', 'Luz (Lux)']];
    
    document.querySelectorAll('#historical-table tbody tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent);
        });
        rows.push(rowData);
    });
    
    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `datos_sensores_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatDateForDB(dateString) {
    if (!dateString) return null;
    return dateString.replace('T', ' ');
}

function showLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}