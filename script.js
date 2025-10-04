document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CHAVE DE API (OPCIONAL, PARA MAPA ESCURO) ---
    const STADIA_API_KEY = "SUA_CHAVE_API_VAI_AQUI";

    // --- 2. CAMADAS DE MAPA BASE (FUNDOS) ---
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });

    // --- 3. CONFIGURAÇÃO INICIAL DO MAPA ---
    const map = L.map('map', { center: [-3.85, -32.42], zoom: 13, layers: [osm] });   

    const sharkIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/172/172366.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -40]
    });

    // --- 4. CATÁLOGO DE CAMADAS DA NASA ---
    const NASA_LAYERS = {
        'fitoplankton': { identifier: 'MODIS_Aqua_Chlorophyll_A', unit: 'mg/m³' },
        'temperatura': { identifier: 'GHRSST_L4_MUR_Sea_Surface_Temperature', unit: '°C' },
        'correntes': { identifier: 'HYCOM_Sea_Water_Velocity_Magnitude_Daily', unit: 'm/s' }
    };

    let phytoplanktonAreasLayer = L.layerGroup().addTo(map);

    // --- 5. REFERÊNCIAS AOS ELEMENTOS DO HTML ---
    const dataTypeSelect = document.getElementById('dataTypeSelect');
    const layerDateInput = document.getElementById('layerDate');
    const analyzeViewBtn = document.getElementById('analyzeViewBtn');
    const infoTextElement = document.getElementById('info-text');
    const ctx = document.getElementById('dynamicChart').getContext('2d');
    let currentNasaLayer = null;

    // --- 6. VALORES PADRÃO ---
    layerDateInput.value = '2025-09-15';
    dataTypeSelect.value = 'nenhuma';

    // --- 7. LÓGICA DO GRÁFICO ---
    const dynamicChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: '', data: [], backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 2, tension: 0.4, fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }
    });

    async function fetchDataAndUpdate() {
        const selectedType = dataTypeSelect.value;
        phytoplanktonAreasLayer.clearLayers(); // Limpa sempre os círculos de área

        if (selectedType === 'nenhuma' || !NASA_LAYERS[selectedType]) {
            dynamicChart.data.labels = [];
            dynamicChart.data.datasets[0].data = [];
            dynamicChart.data.datasets[0].label = 'Nenhuma métrica';
            dynamicChart.update();
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

            if (data.area_points) {
                data.area_points.forEach(point => {
                    const circle = L.circle([point.lat, point.lng], {
                        color: '#28a745',
                        fillColor: '#28a745',
                        fillOpacity: 0.3,
                        radius: 500 // Raio em metros
                    }).addTo(phytoplanktonAreasLayer);

                    circle.bindTooltip(point.label, {
                        permanent: true,
                        direction: 'center',
                        className: 'area-label'
                    });
                });
            }
        } catch (error) {
            console.error("Erro no gráfico:", error);
        }
    }

    // --- 8. LÓGICA DAS CAMADAS DA NASA ---
    function updateNasaLayer() {
        if (currentNasaLayer) {
            map.removeLayer(currentNasaLayer);
            currentNasaLayer = null;
        }
        const selectedType = dataTypeSelect.value;
        const layerInfo = NASA_LAYERS[selectedType];
        if (!layerInfo) return;

        const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerInfo.identifier}/default/${layerDateInput.value}/GoogleMapsCompatible_Level9/{z}/{x}/{y}.png`;
        currentNasaLayer = L.tileLayer(tileUrl, {
            attribution: 'NASA GIBS',
            opacity: 0.75,
            time: layerDateInput.value
        }).addTo(map);
    }

    // --- 9. LÓGICA DE ANÁLISE DE DADOS (GetFeatureInfo) ---
    async function fetchDataForPoint(latlng) {
        const layerInfo = NASA_LAYERS[dataTypeSelect.value];
        if (!layerInfo) return null;

        const mapSize = map.getSize();
        const mapBounds = map.getBounds();
        const bboxString = `${mapBounds.getSouth()},${mapBounds.getWest()},${mapBounds.getNorth()},${mapBounds.getEast()}`;
        const containerPoint = map.latLngToContainerPoint(latlng);

        const params = new URLSearchParams({
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetFeatureInfo',
            LAYERS: layerInfo.identifier,
            QUERY_LAYERS: layerInfo.identifier,
            CRS: 'EPSG:4326',
            BBOX: bboxString,
            WIDTH: mapSize.x,
            HEIGHT: mapSize.y,
            I: String(Math.round(containerPoint.x)),
            J: String(Math.round(containerPoint.y)),
            TIME: layerDateInput.value,
            INFO_FORMAT: 'application/json',
            FEATURE_COUNT: '1'
        });

        const baseUrl = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';
        const url = `${baseUrl}?${params.toString()}`;

        try {
            const resp = await fetch(url);
            if (!resp.ok) return null; // Sai se a requisição falhou

            const contentType = (resp.headers.get('content-type') || '').toLowerCase();
            let value = null;

            if (contentType.includes('application/json')) {
                const data = await resp.json();
                value = data?.features?.[0]?.properties?.value ?? null;
            } else { // Fallback para XML/texto se a resposta não for JSON
                const txt = await resp.text();
                const numMatch = txt.match(/-?\d+(\.\d+)?/);
                if (numMatch) value = parseFloat(numMatch[0]);
            }

            return (value !== null && !isNaN(value)) ? value : null;
        } catch (err) {
            console.error('Erro na requisição GetFeatureInfo:', err);
            return null;
        }
    }

    map.on('click', async (e) => {
        const popup = L.popup().setLatLng(e.latlng).setContent("Buscando dados...").openOn(map);
        const value = await fetchDataForPoint(e.latlng);
        const layerInfo = NASA_LAYERS[dataTypeSelect.value];
        if (value !== null) {
            popup.setContent(`<b>${dataTypeSelect.options[dataTypeSelect.selectedIndex].text}:</b><br>${value.toFixed(2)} ${layerInfo.unit || ''}`);
        } else {
            popup.setContent("Nenhum dado disponível para este ponto.");
        }
    });

    async function analyzeCurrentView() {
        infoTextElement.innerHTML = `<h2>Analisando...</h2><p>Buscando dados da NASA em grade...</p>`;
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
        const validData = results.filter(v => v !== null);
        
        if (validData.length === 0) {
            infoTextElement.innerHTML = `<h2>Análise Concluída</h2><p>Não foram encontrados dados válidos na área visível.</p>`;
            return;
        }
        
        const sum = validData.reduce((a, b) => a + b, 0);
        const avg = sum / validData.length;
        const min = Math.min(...validData);
        const max = Math.max(...validData);
        const layerInfo = NASA_LAYERS[dataTypeSelect.value];
        
        infoTextElement.innerHTML = `
            <h2>Análise da Área Visível</h2>
            <p><strong>Métrica:</strong> ${dataTypeSelect.options[dataTypeSelect.selectedIndex].text}</p>
            <p><strong>Pontos Válidos:</strong> ${validData.length}/${gridSize * gridSize}</p>
            <p><strong>Mín:</strong> ${min.toFixed(2)} | <strong>Média:</strong> ${avg.toFixed(2)} | <strong>Máx:</strong> ${max.toFixed(2)} ${layerInfo.unit || ''}</p>
        `;
    }

    // --- 10. EVENTOS E CARREGAMENTO INICIAL ---
    function handleSelectionChange() {
        fetchDataAndUpdate();
        updateNasaLayer();
    }
    
    dataTypeSelect.addEventListener('change', handleSelectionChange);
    layerDateInput.addEventListener('change', updateNasaLayer);
    if (analyzeViewBtn) {
        analyzeViewBtn.addEventListener('click', analyzeCurrentView);
    }

    async function loadMapPoints() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/map-points');
            const points = await response.json();
            points.forEach(point => {
                L.marker([point.lat, point.lng], { icon: sharkIcon })
                    .addTo(map)
                    .bindPopup(`<b>${point.name}</b><br>${point.description}`);
            });
        } catch (error) {
            console.error("Erro nos pontos do mapa:", error);
        }
    }
    
    fetchDataAndUpdate();   
    loadMapPoints();
    handleSelectionChange();
});