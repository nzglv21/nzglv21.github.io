// Инициализация карты
const map = L.map('map').setView([55.751244, 37.618423], 12); // Москва
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// 2GIS Suggest API
const API_KEY = '6a316891-62f1-4a10-a610-8217e3773c91'; // Замените на ваш API-ключ 2GIS
const suggestEndpoint = `https://catalog.api.2gis.com/3.0/suggest`;

const pickupInput = document.getElementById('pickup');
const dropoffInput = document.getElementById('dropoff');

// Обработка автозаполнения
[pickupInput, dropoffInput].forEach((input) => {
    input.addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            try {
                const response = await axios.get(suggestEndpoint, {
                    params: {
                        q: query,
                        key: API_KEY,
                    },
                });
                console.log(response.data); // Можно добавить отображение подсказок
            } catch (error) {
                console.error('Ошибка 2GIS Suggest:', error);
            }
        }
    });
});

// Обработка формы
document.getElementById('order-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pickup = pickupInput.value;
    const dropoff = dropoffInput.value;
    alert(`Такси заказано!\nОткуда: ${pickup}\nКуда: ${dropoff}`);
});