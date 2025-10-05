document.addEventListener('DOMContentLoaded', () => {
    // --- 1. API KEY (OPTIONAL, FOR DARK MAP) ---
    const STADIA_API_KEY = "YOUR_API_KEY_GOES_HERE";

    // --- 2. BASE MAP LAYERS (BACKGROUNDS) ---
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });

    // --- 3. INITIAL MAP SETUP ---
    const map = L.map('map', { center: [-3.85, -32.42], zoom: 13, layers: [osm] });   

    const sharkIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/172/172366.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -40]
    });

    // --- 4. NASA LAYER CATALOG ---
    // Note: The identifiers are case-sensitive and must match NASA's service.
    const NASA_LAYERS = {
        'phytoplankton': { identifier: 'MODIS_Aqua_Chlorophyll_A', unit: 'mg/m³' },
        'temperature': { identifier: 'GHRSST_L4_MUR_Sea_Surface_Temperature', unit: '°C' },
        'currents': { identifier: 'HYCOM_Sea_Water_Velocity_Magnitude_Daily', unit: 'm/s' }
    };

    let phytoplanktonAreasLayer = L.layerGroup().addTo(map);

    // --- 5. HTML ELEMENT REFERENCES ---
    const dataTypeSelect = document.getElementById('dataTypeSelect');
    const layerDateInput = document.getElementById('layerDate');
    const analyzeViewBtn = document.getElementById('analyzeViewBtn');
    const infoTextElement = document.getElementById('info-text');
    const ctx = document.getElementById('dynamicChart').getContext('2d');
    let currentNasaLayer = null;

    
    // Modal Elements
    const modalBackdrop = document.getElementById('modal-backdrop');
    const sharkModal = document.getElementById('shark-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    // New modal elements
    const modalSharkImage = document.getElementById('modal-shark-image');
    const modalId = document.getElementById('modal-id');
    const modalSpecies = document.getElementById('modal-species');
    const modalSize = document.getElementById('modal-size');
    const modalFood = document.getElementById('modal-food');
    const modalLifeStage = document.getElementById('modal-life-stage');
    const modalTagDate = document.getElementById('modal-tag-date');
    const modalTagLocation = document.getElementById('modal-tag-location');

    // --- 6. DEFAULT VALUES ---
    layerDateInput.value = '2025-09-15';
    dataTypeSelect.value = 'none'; // Changed from 'nenhuma'

    // --- 7. CHART LOGIC ---
    const dynamicChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: '', data: [], backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 2, tension: 0.4, fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }
    });

    async function fetchDataAndUpdate() {
        const selectedType = dataTypeSelect.value;
        phytoplanktonAreasLayer.clearLayers(); // Always clear the area circles

        if (selectedType === 'none' || !NASA_LAYERS[selectedType]) {
            dynamicChart.data.labels = [];
            dynamicChart.data.datasets[0].data = [];
            dynamicChart.data.datasets[0].label = 'No metric selected';
            dynamicChart.update();
            infoTextElement.innerHTML = `<h2>Select a metric</h2><p>Choose a data type from the dropdown to see trends and map overlays.</p>`;
            return;
        }
        try {
            // The backend endpoint might need to be updated to expect English terms (e.g., 'phytoplankton')
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
                        radius: 500 // Radius in meters
                    }).addTo(phytoplanktonAreasLayer);

                    circle.bindTooltip(point.label, {
                        permanent: true,
                        direction: 'center',
                        className: 'area-label'
                    });
                });
            }
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
    }

    // --- 8. NASA LAYER LOGIC ---
    function updateNasaLayer() {
        if (currentNasaLayer) {
            map.removeLayer(currentNasaLayer);
            currentNasaLayer = null;
        }
        const selectedType = dataTypeSelect.value;
        const layerInfo = NASA_LAYERS[selectedType];
        if (!layerInfo) return; // Exit if 'none' or invalid type is selected

        const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerInfo.identifier}/default/${layerDateInput.value}/GoogleMapsCompatible_Level9/{z}/{x}/{y}.png`;
        currentNasaLayer = L.tileLayer(tileUrl, {
            attribution: 'NASA GIBS',
            opacity: 0.75,
            time: layerDateInput.value
        }).addTo(map);
    }

    // --- 9. DATA ANALYSIS LOGIC (GetFeatureInfo) ---
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
            if (!resp.ok) return null; // Exit if the request failed

            const contentType = (resp.headers.get('content-type') || '').toLowerCase();
            let value = null;

            if (contentType.includes('application/json')) {
                const data = await resp.json();
                value = data?.features?.[0]?.properties?.value ?? null;
            } else { // Fallback for XML/text if the response is not JSON
                const txt = await resp.text();
                const numMatch = txt.match(/-?\d+(\.\d+)?/);
                if (numMatch) value = parseFloat(numMatch[0]);
            }

            return (value !== null && !isNaN(value)) ? value : null;
        } catch (err) {
            console.error('Error in GetFeatureInfo:', err);
            return null;
        }
    }

    map.on('click', async (e) => {
        const popup = L.popup().setLatLng(e.latlng).setContent("Fetching data...").openOn(map);
        const value = await fetchDataForPoint(e.latlng);
        const layerInfo = NASA_LAYERS[dataTypeSelect.value];
        if (value !== null && layerInfo) {
            popup.setContent(`<b>${dataTypeSelect.options[dataTypeSelect.selectedIndex].text}:</b><br>${value.toFixed(2)} ${layerInfo.unit || ''}`);
        } else {
            popup.setContent("No data available at this location.");
        }
    });

    async function analyzeCurrentView() {
        infoTextElement.innerHTML = `<h2>Analyzing...</h2><p>Fetching data for the visible area...</p>`;
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
            infoTextElement.innerHTML = `<h2>Analysis Complete</h2><p>No valid data found in the visible area.</p>`;
            return;
        }
        
        const sum = validData.reduce((a, b) => a + b, 0);
        const avg = sum / validData.length;
        const min = Math.min(...validData);
        const max = Math.max(...validData);
        const layerInfo = NASA_LAYERS[dataTypeSelect.value];
        
        infoTextElement.innerHTML = `
            <h2>Visible Area Analysis</h2>
            <p><strong>Metric:</strong> ${dataTypeSelect.options[dataTypeSelect.selectedIndex].text}</p>
            <p><strong>Valid Points:</strong> ${validData.length}/${gridSize * gridSize}</p>
            <p><strong>Min:</strong> ${min.toFixed(2)} | <strong>Average:</strong> ${avg.toFixed(2)} | <strong>Max:</strong> ${max.toFixed(2)} ${layerInfo.unit || ''}</p>
        `;
    }

    // --- 10. EVENTS AND INITIAL LOAD ---
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
                    // .bindPopup(`<b>${point.name}</b><br>${point.description}`)
                    .on('click', () => {
                        return openSharkModal(point);
                    });
            });
        } catch (error) {
            console.error("Error loading map points:", error);
        }
    }

    function openSharkModal(sharkData) {
        // Generic shark image (from a free stock photo service)
        modalSharkImage.src = 'https://images.pexels.com/photos/2747248/pexels-photo-2747248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
        
        // Populates the modal with the clicked shark's data
        modalTitle.textContent = `${sharkData.species} (${sharkData.id})`;
        
        modalId.textContent = sharkData.id;
        modalSpecies.textContent = sharkData.species;
        modalSize.textContent = sharkData.size;
        modalFood.textContent = sharkData.food;
        modalLifeStage.textContent = sharkData.life_stage;
        modalTagDate.textContent = sharkData.tag_date;
        modalTagLocation.textContent = sharkData.tag_location;
        
        modalDescription.textContent = sharkData.description;

        // Shows the modal and the backdrop
        modalBackdrop.classList.remove('hidden');
        sharkModal.classList.remove('hidden');
    }
    
    function closeModal() {
        modalBackdrop.classList.add('hidden');
        sharkModal.classList.add('hidden');
    }

    // Events to close the modal
    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // Initial data load on page startup
    fetchDataAndUpdate();   
    loadMapPoints();
    handleSelectionChange();
});