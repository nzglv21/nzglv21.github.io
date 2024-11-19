// Инициализация карты
const map = L.map('map').setView([55.7558, 37.6173], 12); // Москва

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

// Элементы управления
const formModal = document.getElementById('form-modal');
const openFormBtn = document.getElementById('open-form-btn');
const submitBtn = document.getElementById('submit-btn');

// Открытие модального окна
openFormBtn.addEventListener('click', () => {
  formModal.classList.remove('hidden');
});

// Закрытие формы при отправке
submitBtn.addEventListener('click', () => {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;

  if (from && to) {
    alert(`Такси заказано!\nОткуда: ${from}\nКуда: ${to}`);
    formModal.classList.add('hidden');
  } else {
    alert('Пожалуйста, заполните оба поля.');
  }
});
