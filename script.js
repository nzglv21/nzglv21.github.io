// Инициализация карты
const map = L.map('map').setView([55.751244, 37.618423], 12); // Москва
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// 2GIS Suggest API
const API_KEY = '6a316891-62f1-4a10-a610-8217e3773c91'; // Замените на ваш API-ключ 2GIS
const suggestEndpoint = 'https://catalog.api.2gis.com/3.0/suggests';

const pickupInput = document.getElementById('pickup');
const dropoffInput = document.getElementById('dropoff');

// Функция для отправки запросов
function sendRequest(query, onSuccess, onError) {
    const xhr = new XMLHttpRequest();
    const url = `${suggestEndpoint}?q=${encodeURIComponent(query)}&suggest_type=route_endpoint&key=${API_KEY}`;

    xhr.open('GET', url, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    onSuccess(response);
                } catch (e) {
                    onError('Ошибка парсинга ответа: ' + e.message);
                }
            } else {
                onError(`Ошибка запроса: статус ${xhr.status}, ответ: ${xhr.responseText}`);
            }
        }
    };

    xhr.onerror = function () {
        onError('Ошибка сети');
    };

    xhr.send();
}

// Обработка автозаполнения
[pickupInput, dropoffInput].forEach((input) => {
    input.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            sendRequest(
                query,
                (data) => {
                    console.log('Успешный ответ:', data); // Здесь можно обрабатывать и выводить подсказки
                },
                (error) => {
                    console.error(error);
                }
            );
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