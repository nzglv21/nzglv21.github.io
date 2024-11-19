document.addEventListener("DOMContentLoaded", () => {
    // Инициализация карты OpenStreetMap
    const map = L.map('map').setView([55.751244, 37.618423], 13); // начальная позиция (Москва)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Функция для установки метки на карте и перемещения к координатам
    function setUserLocation(lat, lon) {
        // Устанавливаем метку на текущие координаты
        const marker = L.marker([lat, lon]).addTo(map);
        
        // Перемещаем карту в эти координаты
        map.setView([lat, lon], 13);
    }

    // Получаем координаты пользователя с использованием Geolocation API
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Устанавливаем метку и перемещаем карту
                setUserLocation(lat, lon);
            },
            (error) => {
                alert("Ошибка получения координат: " + error.message);
                // Если не удалось получить координаты, ставим метку по умолчанию (Москва)
                setUserLocation(55.751244, 37.618423);
            }
        );
    } else {
        alert("Геолокация не поддерживается этим браузером.");
        // Если геолокация не поддерживается, ставим метку по умолчанию (Москва)
        setUserLocation(55.751244, 37.618423);
    }

    const formContainer = document.getElementById('form-container');
    const inputs = document.querySelectorAll('#form input');

    // Поднимаем форму вверх при фокусе
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
