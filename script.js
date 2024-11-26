document.addEventListener("DOMContentLoaded", () => {
    const tg = window.Telegram.WebApp; // Инициализируем Telegram WebApp
    try {
        tg.expand();
        tg.requestFullscreen();
        tg.disableVerticalSwipes();
    } catch (error) {
        console.log(1);
    }

    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const formContainer = document.getElementById('form-container');
    const mapBtnFrom = document.getElementById('map-btn-from');
    const mapBtnTo = document.getElementById('map-btn-to');
    const ZOOM = 18;
    const apiKey = '810da77a-9a4b-43a9-86db-9c1435feaf77';
    const defaultLocation = { lat: 54.735152, lon: 55.958736}; // Москва, начальная точка
    const map = L.map('map',
        {
            zoomControl: false
        }
    ).setView([defaultLocation.lat, defaultLocation.lon], ZOOM); // Москва

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,

    }).addTo(map);


    let activeField = '1';
    let fromMarker = L.marker([defaultLocation.lat, defaultLocation.lon], { draggable: false }).addTo(map);
    let toMarker = null;
    let isUserLocationSet = false;
    let typingTimeout, geocodeTimeout;


    const delay = 1000; // Задержка в миллисекундах

    const toggleFormBtn = document.getElementById('toggle-form-btn');

    toggleFormBtn.addEventListener('click', () => {
        // Переключение состояния формы
        formContainer.classList.toggle('active');
        activeField = '';
    });

    function updateFromMarker(lat, lon, isUserLocation = false) {
        const fromInput = document.getElementById('from');
        fromMarker.setLatLng([lat, lon]);

        if (!isUserLocation) {
            updateInputWithGeocode('from', lat, lon);
        } else {
            fromInput.value = "Ваше местоположение";
            isUserLocationSet = true;
        }
    }



    function updateToMarker(lat, lon, clearValue = true) {
        if (toMarker) {
            toMarker.setLatLng([lat, lon]);
        } else {
            toMarker = L.marker([lat, lon], { draggable: true }).addTo(map);
            toMarker.setIcon(redIcon);

            // Добавляем обработчик перемещения для "Куда"
            toMarker.on('moveend', (e) => {
                const position = e.target.getLatLng();
                updateInputWithGeocode('to', position.lat, position.lng);
            });
        }

        if (clearValue) {
            document.getElementById('to').value = "";
        } else {
            updateInputWithGeocode('to', lat, lon);
        }
    }

    // Создаем иконку для нового маркера
    var redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        draggable: false
        // Путь к изображению
    });

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
        const fromCoords = fromMarker.getLatLng();
        if (query.length >= 3) { // Проверяем, что длина запроса >= 3 символов
            const url = `https://catalog.api.2gis.com/3.0/suggests?q=Уфа, ${query}&fields=items.point&sort_point=${fromCoords.lat},${fromCoords.lng}&suggest_type=route_endpoint&key=${apiKey}`;

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
                formContainer.classList.toggle('active');
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



 // Проверка, открыта ли клавиатура на мобильных устройствах
function handleResize() {
    const formContainer = document.getElementById('form-container');
    const isKeyboardOpen = window.innerHeight < 500; // Если высота окна меньше 500px, считаем, что клавиатура открыта
    if (isKeyboardOpen) {
        formContainer.classList.add('keyboard-open');
    } else {
        formContainer.classList.remove('keyboard-open');
    }
}

// Добавление обработчика события на изменение размера окна
// window.addEventListener('resize', handleResize);
// handleResize();

// Функция для обработки фокуса на поле "Откуда"
fromInput.addEventListener('focus', () => {
    // Прокручиваем поле ввода в видимую область только если клавиатура открыта


    // Устанавливаем активное поле
    activeField = '';
    activateField('from');
    
    // Активируем форму
    formContainer.classList.add('active');
    
    // Центрируем карту на маркере
    const center = fromMarker.getLatLng();
    map.setView([center.lat, center.lng], ZOOM);
});

// Функция для обработки фокуса на поле "Куда"
toInput.addEventListener('focus', () => {
    activeField = '';
    activateField('to');
    formContainer.classList.add('active');

    const center = toMarker ? toMarker.getLatLng() : fromMarker.getLatLng();
    map.setView([center.lat, center.lng], ZOOM);

    // Прокручиваем страницу наверх, но только если клавиатура открыта
    if (window.innerHeight < 500) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Плавная прокрутка
        });

        // Прокручиваем немного вниз, чтобы избежать перекрытия клавиатуры
        window.scrollTo({
            top: 1,
            behavior: 'smooth' // Плавная прокрутка
        });
    }

    // Прокручиваем поле "Куда" в видимую область, если клавиатура открыта
    if (window.innerHeight < 500) {
        toInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});


    map.on('move', () => {
        const center = map.getCenter();
        if (activeField === 'from') {
            updateFromMarker(center.lat, center.lng, false); // Указываем, что это не пользовательское местоположение
        } else if (activeField === 'to') {
            updateToMarker(center.lat, center.lng, false);
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
        formContainer.classList.remove('active');
        activeField = 'from';
        map.setView(fromMarker.getLatLng(), ZOOM);
    });

    document.getElementById('map-btn-to').addEventListener('click', () => {
        formContainer.classList.remove('active');
        activeField = 'to';
        if (toMarker) {
            map.setView(toMarker.getLatLng(), ZOOM);
        } else {
            const fromCoords = fromMarker.getLatLng();
            map.setView([fromCoords.lat + 0.001, fromCoords.lng + 0.001], ZOOM);
        }
    });


    function reverseGeocode(lat, lon, callback) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&lat=${lat}&lon=${lon}&accept-language=ru`;
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data.display_name.split(', ').slice(0, 3).join(', '));
                data.address
                const address = data.display_name.split(', ').slice(0, 3).join(', ')|| "Неизвестный адрес";
                callback(address);
            })
            .catch(error => {
                console.error("Ошибка при геокодировании:", error);
                callback("Не удалось определить адрес");
            });
    }

    function updateInputWithGeocode(field, lat, lon) {
        clearTimeout(geocodeTimeout);
        geocodeTimeout = setTimeout(() => {
            reverseGeocode(lat, lon, (address) => {
                document.getElementById(field).value = address;
            });
        }, delay);
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', () => {
        const from = fromInput.value;
        const entrance = document.getElementById('entrance').value; // Получаем значение из поля "Подъезд"
        const to = toInput.value;
        const fromCoords = fromMarker.getLatLng();
        const toCoords = toMarker ? toMarker.getLatLng() : null;
    
        const data = {
            from: {
                address: from,
                entrance: entrance, // Добавляем новый элемент "entrance"
                coords: { lat: fromCoords.lat, lon: fromCoords.lng }
            },
            to: {
                address: to,
                coords: toCoords ? { lat: toCoords.lat, lon: toCoords.lng } : null
            }
        };
    
        tg.sendData(JSON.stringify(data)); // Отправляем данные в бота
    });
});
