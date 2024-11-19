document.addEventListener("DOMContentLoaded", () => {
    // Инициализация карты OpenStreetMap
    const map = L.map('map').setView([55.751244, 37.618423], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

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
