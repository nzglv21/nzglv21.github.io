document.addEventListener("DOMContentLoaded", () => {
    // Инициализация карты OpenStreetMap
    const map = L.map('map').setView([55.751244, 37.618423], 13); // начальная позиция (Москва)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Переменная для хранения флага, который отслеживает, какое поле активно
    let activeField = 'from'; // по умолчанию активен "Откуда"

    // Инициализация метки
    let userMarker = L.marker([55.751244, 37.618423], { draggable: true }).addTo(map); // начальная метка в Москве
    userMarker.bindPopup("Ваша позиция").openPopup();

    // Функция для изменения метки и перемещения карты
    function updateUserMarker(lat, lon) {
        userMarker.setLatLng([lat, lon]);  // обновляем позицию метки
    }

    // Получаем координаты пользователя с использованием Geolocation API
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Обновляем метку и карту
                updateUserMarker(lat, lon);
                map.setView([lat, lon], 13); // Перемещаем карту в центр координат пользователя
            },
            (error) => {
                alert("Ошибка получения координат: " + error.message);
                // Если не удалось получить координаты, ставим метку по умолчанию (Москва)
                updateUserMarker(55.751244, 37.618423);
            }
        );
    } else {
        alert("Геолокация не поддерживается этим браузером.");
        // Если геолокация не поддерживается, ставим метку по умолчанию (Москва)
        updateUserMarker(55.751244, 37.618423);
    }

    // Функция для активации поля
    function activateField(field) {
        document.getElementById('from').classList.remove('active-field');
        document.getElementById('to').classList.remove('active-field');
        document.getElementById(field).classList.add('active-field');
    }

    // При фокусе на поле "Откуда" или "Куда" меняем флаг и активируем нужное поле
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');

    fromInput.addEventListener('focus', () => {
        activeField = 'from';
        activateField('from');
    });

    toInput.addEventListener('focus', () => {
        activeField = 'to';
        activateField('to');
    });

    // При перемещении карты обновляем метку
    map.on('move', () => {
        const center = map.getCenter();
        updateUserMarker(center.lat, center.lng);

        // Обновляем значение поля в зависимости от того, какое поле активно
        if (activeField === 'from') {
            fromInput.value = `Lat: ${center.lat.toFixed(5)}, Lon: ${center.lng.toFixed(5)}`;
        } else if (activeField === 'to') {
            toInput.value = `Lat: ${center.lat.toFixed(5)}, Lon: ${center.lng.toFixed(5)}`;
        }
    });

    // Поднимаем форму вверх при фокусе на поля
    const formContainer = document.getElementById('form-container');
    const inputs = document.querySelectorAll('#form input');

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            formContainer.classList.add('active');
        });

        input.addEventListener('blur', () => {
            // Сбрасываем форму вниз при отсутствии фокуса
            setTimeout(() => {
                if (![...inputs].some(inp => inp === document.activeElement)) {
                    formContainer.classList.remove('active');
                }
            }, 200);
        });
    });

    // Обработка отправки формы
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', () => {
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        alert(`Заказ оформлен: \nОткуда: ${from}\nКуда: ${to}`);
        formContainer.classList.remove('active');
    });
});
