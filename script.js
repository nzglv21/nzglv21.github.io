// Инициализация карты
var map = L.map('map').setView([54.7387, 55.9721], 13); // Уфа

// Добавление слоя OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Маркеры для начала и конца пути
var startMarker = null;
var endMarker = null;
var routeLine = null;

// Переменные для хранения GPS координат
var pickupCoords = null;
var destinationCoords = null;

// Функция для установки маркера
function setMarker(lat, lon, marker) {
    if (marker) {
        map.removeLayer(marker);
    }
    return L.marker([lat, lon]).addTo(map);
}

// Обработка кликов по карте
map.on('click', function(e) {
    if (!startMarker) {
        startMarker = setMarker(e.latlng.lat, e.latlng.lng, startMarker);
        pickupCoords = [e.latlng.lat, e.latlng.lng];
    } else if (!endMarker) {
        endMarker = setMarker(e.latlng.lat, e.latlng.lng, endMarker);
        destinationCoords = [e.latlng.lat, e.latlng.lng];
        drawRoute();
    }
});

// Функция для прокладки маршрута
function drawRoute() {
    if (startMarker && endMarker) {
        if (routeLine) {
            map.removeLayer(routeLine);
        }
        const start = startMarker.getLatLng();
        const end = endMarker.getLatLng();
        fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`)
            .then(response => response.json())
            .then(data => {
                const coordinates = data.routes[0].geometry.coordinates;
                const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
                routeLine = L.polyline(latLngs, {color: 'red'}).addTo(map);
                map.fitBounds(routeLine.getBounds());
            });
    }
}

// Функция для автозаполнения адресов
function autocompleteAddress(input, datalistId) {
    input.addEventListener('input', function() {
        const query = input.value;
        if (query.length > 3) {
            fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&viewbox=54.552816,55.840546,54.892817,56.203883&bounded=1`)
                .then(response => response.json())
                .then(data => {
                    const datalist = document.getElementById(datalistId);
                    datalist.innerHTML = '';
                    data.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item.display_name;
                        option.setAttribute('data-lat', item.lat);
                        option.setAttribute('data-lon', item.lon);
                        datalist.appendChild(option);
                    });
                });
        }
    });

    input.addEventListener('change', function() {
        const selectedOption = document.querySelector(`#${datalistId} option[value="${input.value}"]`);
        if (selectedOption) {
            const lat = selectedOption.getAttribute('data-lat');
            const lon = selectedOption.getAttribute('data-lon');
            if (input.id === 'pickup') {
                startMarker = setMarker(lat, lon, startMarker);
                pickupCoords = [lat, lon];
            } else if (input.id === 'destination') {
                endMarker = setMarker(lat, lon, endMarker);
                destinationCoords = [lat, lon];
                drawRoute();
            }
        }
    });
}

// Обработка автозаполнения для полей ввода
autocompleteAddress(document.getElementById('pickup'), 'pickupList');
autocompleteAddress(document.getElementById('destination'), 'destinationList');

// Обработка формы
document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const pickup = document.getElementById('pickup').value;
    const destination = document.getElementById('destination').value;

    // Отправка данных обратно в Telegram
    Telegram.WebApp.sendData({
        pickup: pickup,
        destination: destination,
        pickupCoords: pickupCoords,
        destinationCoords: destinationCoords
    });

    // Закрытие веб-приложения
    Telegram.WebApp.close();
});

// Автоматическое заполнение поля "Откуда" с помощью GPS
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        startMarker = setMarker(lat, lon, startMarker);
        pickupCoords = [lat, lon];
        map.setView([lat, lon], 13);

        // Получение адреса по GPS координатам
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('pickup').value = data.display_name;
            });
    });
}

// Обработка изменения полей ввода
document.getElementById('pickup').addEventListener('change', function() {
    const selectedOption = document.querySelector(`#pickupList option[value="${this.value}"]`);
    if (selectedOption) {
        const lat = selectedOption.getAttribute('data-lat');
        const lon = selectedOption.getAttribute('data-lon');
        startMarker = setMarker(lat, lon, startMarker);
        pickupCoords = [lat, lon];
        drawRoute();
    }
});

document.getElementById('destination').addEventListener('change', function() {
    const selectedOption = document.querySelector(`#destinationList option[value="${this.value}"]`);
    if (selectedOption) {
        const lat = selectedOption.getAttribute('data-lat');
        const lon = selectedOption.getAttribute('data-lon');
        endMarker = setMarker(lat, lon, endMarker);
        destinationCoords = [lat, lon];
        drawRoute();
    }
});
