document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CHAVE DE API (OPCIONAL, PARA MAPA ESCURO) ---
    // Obtenha uma chave em stadiamaps.com e cole aqui
    const STADIA_API_KEY = "SUA_CHAVE_API_VAI_AQUI";

    // --- 2. CAMADAS DE MAPA BASE (FUNDOS) ---
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' });
    const dark = L.tileLayer(`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`, { attribution: '&copy; Stadia Maps' });

    // --- 3. CONFIGURAÇÃO INICIAL DO MAPA ---
    const map = L.map('map', { center: [-38.0, -52.0], zoom: 5, layers: [osm] });
    const baseMaps = { "Ruas": osm, "Satélite": satellite, "Escuro": dark };
    L.control.layers(baseMaps).addTo(map);

    // --- 4. CATÁLOGO DE CAMADAS DA NASA ---
    const NASA_LAYERS = {
        'fitoplankton': { identifier: 'MODIS_Aqua_Chlorophyll_A', unit: 'mg/m³' },
        'temperatura': { identifier: 'GHRSST_L4_MUR_Sea_Surface_Temperature', unit: '°C' },
        'correntes': { identifier: 'HYCOM_Sea_Water_Velocity_Magnitude_Daily', unit: 'm/s' }
    };

    // --- 5. REFERÊNCIAS AOS ELEMENTOS DO HTML ---
    const dataTypeSelect = document.getElementById('dataTypeSelect');
    const layerDateInput = document.getElementById('layerDate');
    const analyzeViewBtn = document.getElementById('analyzeViewBtn');
    const infoTextElement = document.getElementById('info-text');
    const ctx = document.getElementById('dynamicChart').getContext('2d');
    let currentNasaLayer = null;

    // --- 6. VALORES PADRÃO ---
    const defaultDate = new Date();
    defaultDate.setDate(new Date().getDate() - 2); // D-2 para garantir dados
    layerDateInput.value = defaultDate.toISOString().split('T')[0];
    dataTypeSelect.value = 'fitoplankton';

    // --- 7. LÓGICA DO GRÁFICO ---
    const dynamicChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: '', data: [], backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 2, tension: 0.4, fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }
    });

    async function fetchDataAndUpdate() {
        const selectedType = dataTypeSelect.value;
        if (selectedType === 'nenhuma' || !NASA_LAYERS[selectedType]) {
            dynamicChart.data.labels = []; dynamicChart.data.datasets[0].data = []; dynamicChart.data.datasets[0].label = 'Nenhuma métrica'; dynamicChart.update();
            infoTextElement.innerHTML = `<h2>Selecione uma Métrica</h2>`;
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/data?dataType=${selectedType}`);
            const data = await response.json();
            dynamicChart.data.datasets[0].label = data.chart_data.label;
            dynamicChart.data.labels = data.chart_data.labels;
            dynamicChart.data.datasets[0].data = data.chart_data.values;
            dynamicChart.update();
            infoTextElement.innerHTML = `<h2>${data.text_data.title}</h2><p>${data.text_data.content}</p>`;
        } catch (error) { console.error("Erro no gráfico:", error); }
    }

    // --- 8. LÓGICA DAS CAMADAS DA NASA ---
    function updateNasaLayer() {
        if (currentNasaLayer) { map.removeLayer(currentNasaLayer); }
        const selectedType = dataTypeSelect.value;
        const layerInfo = NASA_LAYERS[selectedType];
        if (!layerInfo) return;
        const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerInfo.identifier}/default/${layerDateInput.value}/GoogleMapsCompatible_Level9/{z}/{x}/{y}.png`;
        currentNasaLayer = L.tileLayer(tileUrl, { attribution: 'NASA GIBS', opacity: 0.75 }).addTo(map);
    }

    // --- 9. LÓGICA DE ANÁLISE DE DADOS NO MAPA ---
    async function fetchDataForPoint(latlng) {
        const layerInfo = NASA_LAYERS[dataTypeSelect.value];
        if (!layerInfo) return null;
        const params = {
            service: 'WMS', version: '1.3.0', request: 'GetFeatureInfo', layers: layerInfo.identifier, query_layers: layerInfo.identifier,
            crs: 'EPSG:3857', bbox: map.getBounds().toBBoxString(), width: map.getSize().x, height: map.getSize().y,
            i: Math.round(map.latLngToContainerPoint(latlng).x), j: Math.round(map.latLngToContainerPoint(latlng).y),
            time: layerDateInput.value, info_format: 'application/json'
        };
        const url = `https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?${new URLSearchParams(params)}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.features[0]?.properties?.value ? parseFloat(data.features[0].properties.value) : null;
        } catch { return null; }
    }

    map.on('click', async (e) => {
        const popup = L.popup().setLatLng(e.latlng).setContent("Buscando dados...").openOn(map);
        const value = await fetchDataForPoint(e.latlng);
        const layerInfo = NASA_LAYERS[dataTypeSelect.value];
        if (value !== null && !isNaN(value)) {
            popup.setContent(`<b>${dataTypeSelect.options[dataTypeSelect.selectedIndex].text}:</b><br>${value.toFixed(2)} ${layerInfo.unit || ''}`);
        } else {
            popup.setContent("Nenhum dado disponível para este ponto.");
        }
    });

    async function analyzeCurrentView() {
        infoTextElement.innerHTML = `<h2>Analisando...</h2><p>Buscando dados da NASA em grade. Isso pode levar alguns segundos.</p>`;
        const bounds = map.getBounds();
        const gridSize = 7;
        const promises = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const lat = bounds.getSouth() + (bounds.getNorth() - bounds.getSouth()) * i / (gridSize - 1);
                const lng = bounds.getWest() + (bounds.getEast() - bounds.getWest()) * j / (gridSize - 1);
                promises.push(fetchDataForPoint(L.latLng(lat, lng)));
            }
        }
        const results = await Promise.all(promises);
        console.log('results ', results);
        const validData = results.filter(v => v !== null && !isNaN(v));
        if (validData.length === 0) {
            infoTextElement.innerHTML = `<h2>Análise Concluída</h2><p>Não foram encontrados dados válidos na área visível.</p>`;
            return;
        }
        const sum = validData.reduce((a, b) => a + b, 0);
        const avg = sum / validData.length;
        const min = Math.min(...validData);
        const max = Math.max(...validData);
        const layerInfo = NASA_LAYERS[dataTypeSelect.value];
        infoTextElement.innerHTML = `<h2>Análise da Área Visível</h2><p><strong>Métrica:</strong> ${dataTypeSelect.options[dataTypeSelect.selectedIndex].text}</p><p><strong>Pontos Válidos:</strong> ${validData.length}/${gridSize * gridSize}</p><p><strong>Mín:</strong> ${min.toFixed(2)} | <strong>Média:</strong> ${avg.toFixed(2)} | <strong>Máx:</strong> ${max.toFixed(2)} ${layerInfo.unit || ''}</p>`;
    }

    // --- 10. EVENTOS E CARREGAMENTO INICIAL ---
    function handleSelectionChange() { fetchDataAndUpdate(); updateNasaLayer(); }
    dataTypeSelect.addEventListener('change', handleSelectionChange);
    layerDateInput.addEventListener('change', updateNasaLayer);
    analyzeViewBtn.addEventListener('click', analyzeCurrentView);

    async function loadMapPoints() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/map-points');
            const points = await response.json();
            points.forEach(point => {
                L.marker([point.lat, point.lng]).addTo(map).bindPopup(`<b>${point.name}</b><br>${point.description}`);
            });
        } catch (error) { console.error("Erro nos pontos do mapa:", error); }
    }
    
    loadMapPoints();
    handleSelectionChange();
});