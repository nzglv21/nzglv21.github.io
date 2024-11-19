document.addEventListener("DOMContentLoaded", () => {
    // Инициализация карты OpenStreetMap
    const map = L.map('map').setView([55.751244, 37.618423], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Управление формой
    const openFormBtn = document.getElementById('open-form-btn');
    const formContainer = document.getElementById('form-container');

    openFormBtn.addEventListener('click', () => {
        formContainer.style.bottom = formContainer.style.bottom === '0px' ? '-300px' : '0px';
    });

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', () => {
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        alert(`Заказ оформлен: \nОткуда: ${from}\nКуда: ${to}`);
    });
});
