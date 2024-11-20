document.addEventListener("DOMContentLoaded", () => {
    const ZOOM = 16;
    const apiKey = '6a316891-62f1-4a10-a610-8217e3773c91';
    const defaultLocation = { lat: 55.751244, lon: 37.618423 }; // Москва, начальная точка
    const map = L.map('map').setView([defaultLocation.lat, defaultLocation.lon], ZOOM); // Москва
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    let activeField = '';
    let fromMarker = L.marker([defaultLocation.lat, defaultLocation.lon], { draggable: true }).addTo(map);
    let toMarker = null;
    let isUserLocationSet = false;

    let typingTimeout;

    const delay = 1000; // Задержка в миллисекундах

    function updateFromMarker(lat, lon, isUserLocation = false) {
        const fromInput = document.getElementById('from');
        fromMarker.setLatLng([lat, lon], ZOOM);

        if (!isUserLocationSet || !isUserLocation) {
            fromInput.value = "";  // Очищаем поле или заменяем на пустую строку
        }

        if (isUserLocation) {
            fromInput.value = "Ваше местоположение";
            isUserLocationSet = true;
        }
    }

    // Создаем иконку для нового маркера
    var redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', // Путь к изображению
    });

    function updateToMarker(lat, lon, clear_value = true) {
        if (toMarker) {
            toMarker.setLatLng([lat, lon], ZOOM);
        } else {
            toMarker = L.marker([lat, lon]).addTo(map);
            toMarker.setIcon(redIcon);
        }
        if (clear_value)
            document.getElementById('to').value = "";  // Очищаем поле или заменяем на пустую строку
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                updateFromMarker(lat, lon, true);  // Обновляем маркер
                map.setView([lat, lon], ZOOM);  // Центрируем карту на текущем местоположении
                document.getElementById('from').value = "Ваше местоположение";  // Устанавливаем текст в поле "Откуда"
            },
            (error) => {
                alert("Ошибка получения координат: " + error.message);
                updateFromMarker(defaultLocation.lat, defaultLocation.lon);
            }
        );
    } else {
        alert("Геолокация не поддерживается этим браузером.");
        updateFromMarker(defaultLocation.lat, defaultLocation.lon);
    }

    function getSuggestions(query) {
        if (query.length >= 3) { // Проверяем, что длина запроса >= 3 символов
            const url = `https://catalog.api.2gis.com/3.0/suggests?q=${query}&fields=items.point&sort_point=37.630866,55.752256&suggest_type=route_endpoint&key=${apiKey}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    displaySuggestions(data.result.items);
                })
                .catch(error => console.error('Ошибка при запросе к API:', error));
        }
    }

    // Функция для отображения подсказок в поле ввода
    function displaySuggestions(items) {
        const suggestionList = document.getElementById(`suggestions-list-${activeField}`);
        suggestionList.innerHTML = '';

        items.forEach(item => {
            const suggestionText = item.name;
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('suggestion-item');
            suggestionElement.textContent = suggestionText;

            suggestionElement.addEventListener('click', () => {
                if (activeField === 'from') {
                    document.getElementById('from').value = suggestionText;
                    // Перемещаем маркер "Откуда" на выбранную точку
                    const lat = item.point.lat;
                    const lon = item.point.lon;
                    fromMarker.setLatLng([lat, lon], ZOOM);
                    activeField = '';
                    map.setView([lat, lon], ZOOM);  // Центрируем карту на новой точке
                } else if (activeField === 'to') {
                    document.getElementById('to').value = suggestionText;
                    // Перемещаем маркер "Куда" на выбранную точку
                    const lat = item.point.lat;
                    const lon = item.point.lon;
                    activeField = '';
                    updateToMarker(lat, lon, false);
                    map.setView([lat, lon], ZOOM);  // Центрируем карту на новой точке
                }
                suggestionList.innerHTML = '';  // Скрыть подсказки после выбора
            });

            suggestionList.appendChild(suggestionElement);
        });
    }

    // Функция для активации поля ввода
    function activateField(field) {
        document.getElementById('from').classList.remove('active-field');
        document.getElementById('to').classList.remove('active-field');
        document.getElementById(field).classList.add('active-field');
    }

    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const formContainer = document.getElementById('form-container');

    fromInput.addEventListener('focus', () => {
        activeField = 'from';
        activateField('from');
        formContainer.classList.add('active');
        const center = fromMarker.getLatLng();
        map.setView([center.lat, center.lng], ZOOM);
    });

    toInput.addEventListener('focus', () => {
        activeField = 'to';
        activateField('to');
        formContainer.classList.add('active');
        const center = toMarker ? toMarker.getLatLng() : fromMarker.getLatLng();
        map.setView([center.lat, center.lng], ZOOM);
    });

    map.on('move', () => {
        const center = map.getCenter();
        if (activeField === 'from') {
            updateFromMarker(center.lat, center.lng, false); // Указываем, что это не пользовательское местоположение
        } else if (activeField === 'to') {
            updateToMarker(center.lat, center.lng, ZOOM);
        }
    });

    // Дебаунсинг для поля "Откуда"
    fromInput.addEventListener('input', () => {
        activeField = 'from';
        const query = fromInput.value;

        // Очистка предыдущего таймаута
        clearTimeout(typingTimeout);

        // Устанавливаем новый таймаут
        typingTimeout = setTimeout(() => {
            getSuggestions(query);
        }, delay);
    });

    // Дебаунсинг для поля "Куда"
    toInput.addEventListener('input', () => {
        activeField = 'to';
        const query = toInput.value;

        // Очистка предыдущего таймаута
        clearTimeout(typingTimeout);

        // Устанавливаем новый таймаут
        typingTimeout = setTimeout(() => {
            getSuggestions(query);
        }, delay);
    });

    document.getElementById('map-btn-from').addEventListener('click', () => {
        activeField = 'from';
        map.setView(fromMarker.getLatLng(), ZOOM);
        formContainer.classList.remove('active');
    });

    document.getElementById('map-btn-to').addEventListener('click', () => {
        activeField = 'to';
        if (toMarker) {
            map.setView(toMarker.getLatLng(), ZOOM);
        } else {
            const fromCoords = fromMarker.getLatLng();
            map.setView([fromCoords.lat + 0.001, fromCoords.lng + 0.001], ZOOM);
        }
        formContainer.classList.remove('active');
    });

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', () => {
        const from = fromInput.value;
        const to = toInput.value;
        alert(`Заказ оформлен: \nОткуда: ${from}\nКуда: ${to}`);
        formContainer.classList.remove('active');
    });
});
