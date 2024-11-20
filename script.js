document.addEventListener("DOMContentLoaded", () => {
    const apiKey = '6a316891-62f1-4a10-a610-8217e3773c91';
    const defaultLocation = { lat: 55.751244, lon: 37.618423 }; // Москва, начальная точка
    const map = L.map('map').setView([defaultLocation.lat, defaultLocation.lon], 13); // Москва
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    let activeField = 'from';
    let fromMarker = L.marker([defaultLocation.lat, defaultLocation.lon], { draggable: true }).addTo(map);
    let toMarker = null;
    let isUserLocationSet = false;

    let typingTimeout;

    const delay = 1500; // Задержка в миллисекундах

    function updateFromMarker(lat, lon, isUserLocation = false) {
        const fromInput = document.getElementById('from');
        fromMarker.setLatLng([lat, lon]);

        // Обновляем значение поля только если это не пользовательское местоположение
        if (!isUserLocationSet || !isUserLocation) {
            fromInput.value = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
        }

        if (isUserLocation) {
            fromInput.value = "Ваше местоположение"; // Устанавливаем текст "Ваше местоположение"
            isUserLocationSet = true;
        }
    }

    function updateToMarker(lat, lon) {
        if (toMarker) {
            toMarker.setLatLng([lat, lon]);
        } else {
            toMarker = L.marker([lat, lon]).addTo(map);
        }
        document.getElementById('to').value = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                updateFromMarker(lat, lon, true);
                map.setView([lat, lon], 13);
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
            const url = `https://catalog.api.2gis.com/3.0/suggests?q=${query}&fields=items.point&sort_point=37.630866,55.752256&key=6a316891-62f1-4a10-a610-8217e3773c91`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    // Обработка и отображение подсказок
                    displaySuggestions(data.result.items);
                })
                .catch(error => console.error('Ошибка при запросе к API:', error));
        }
    }

    // Функция для отображения подсказок в поле ввода
    function displaySuggestions(items) {
        const suggestionList = document.getElementById('suggestions-list');
        suggestionList.innerHTML = '';

        items.forEach(item => {
            const suggestionText = item.search_attributes.suggested_text;
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('suggestion-item');
            suggestionElement.textContent = suggestionText;
            suggestionElement.addEventListener('click', () => {
                if (activeField === 'from') {
                    document.getElementById('from').value = suggestionText;
                    // Можно добавить логику для установки маркера на выбранную точку
                } else {
                    document.getElementById('to').value = suggestionText;
                    // Можно добавить логику для установки маркера на выбранную точку
                }
                suggestionList.innerHTML = ''; // Скрыть подсказки после выбора
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
        map.setView([center.lat, center.lng], 13);
    });

    toInput.addEventListener('focus', () => {
        activeField = 'to';
        activateField('to');
        formContainer.classList.add('active');
        const center = toMarker ? toMarker.getLatLng() : fromMarker.getLatLng();
        map.setView([center.lat, center.lng], 13);
    });

    map.on('move', () => {
        const center = map.getCenter();
        if (activeField === 'from') {
            updateFromMarker(center.lat, center.lng, false); // Указываем, что это не пользовательское местоположение
        } else if (activeField === 'to') {
            updateToMarker(center.lat, center.lng);
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
        map.setView(fromMarker.getLatLng(), 13);
        formContainer.classList.remove('active');
    });

    document.getElementById('map-btn-to').addEventListener('click', () => {
        activeField = 'to';
        if (toMarker) {
            map.setView(toMarker.getLatLng());
        } else {
            const fromCoords = fromMarker.getLatLng();
            map.setView([fromCoords.lat + 0.001, fromCoords.lng + 0.001]);
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
