document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURAÇÃO INICIAL DO MAPA ---
    // Coordenadas agora centradas em Santos, SP
    const map = L.map('map').setView([-23.9618, -46.3322], 13);
    
    // Camada base do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- 2. FUNÇÃO PARA CARREGAR PONTOS NO MAPA (VINDOS DO BACKEND) ---
    async function loadMapPoints() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/map-points');
            const points = await response.json();

            points.forEach(point => {
                L.marker([point.lat, point.lng])
                    .addTo(map)
                    .bindPopup(`<b>${point.name}</b><br>${point.description}`);
            });
        } catch (error) {
            console.error("Erro ao carregar pontos do mapa:", error);
        }
    }
    
    // Chama a função para popular o mapa assim que a página carrega
    loadMapPoints();

    // --- 3. LÓGICA DO GRÁFICO E DO TEXTO (CORRIGIDA E COMPLETA) ---
    const mapTypeSelect = document.getElementById('mapType');
    const infoTextElement = document.getElementById('info-text');
    const ctx = document.getElementById('dynamicChart').getContext('2d');
    
    // Instanciação completa do gráfico
    const dynamicChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Carregando...',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // Função que busca os dados para o gráfico e o texto
    async function fetchDataAndUpdate() {
        const selectedType = mapTypeSelect.value;
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/data?dataType=${selectedType}`);
            const data = await response.json();

            // Atualiza o gráfico
            dynamicChart.data.datasets[0].label = data.chart_data.label;
            dynamicChart.data.labels = data.chart_data.labels;
            dynamicChart.data.datasets[0].data = data.chart_data.values;
            dynamicChart.update();

            // Atualiza a área de texto
            infoTextElement.innerHTML = `
                <h2>${data.text_data.title}</h2>
                <p>${data.text_data.content}</p>
            `;
        } catch (error) {
            console.error("Erro ao buscar dados do gráfico:", error);
            infoTextElement.innerHTML = `<h2>Erro ao carregar dados</h2><p>Não foi possível conectar ao servidor.</p>`;
        }
    }
    
    // Adiciona o "escutador" para atualizar o gráfico quando o seletor muda
    mapTypeSelect.addEventListener('change', fetchDataAndUpdate);

    // Chama a função para carregar os dados iniciais do gráfico e texto
    fetchDataAndUpdate();
    // Define um intervalo para atualizar os dados periodicamente
    setInterval(fetchDataAndUpdate, 5000);
});