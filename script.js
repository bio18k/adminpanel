// ===== ДАННЫЕ В ПАМЯТИ =====
// ===== ПОЛЬЗОВАТЕЛИ И ПАРОЛИ =====
const USERS = {
    'admin': {
        password: 'gym2026',
        name: 'Главный администратор',
        role: 'admin'
    },
    'manager': {
        password: 'manager123',
        name: 'Менеджер',
        role: 'manager'
    }
};

let currentUser = null;

// ===== ПРОВЕРКА ПАРОЛЯ =====
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const userSelect = document.getElementById('userSelect');
    const loginError = document.getElementById('loginError');
    
    if (!passwordInput || !userSelect) return;
    
    const username = userSelect.value;
    const password = passwordInput.value;
    
    if (USERS[username] && USERS[username].password === password) {
        // Успешный вход
        currentUser = {
            username: username,
            name: USERS[username].name,
            role: USERS[username].role
        };
        
        // Сохраняем сессию
        sessionStorage.setItem('gym_current_user', JSON.stringify(currentUser));
        
        // Показываем админку
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        
        // Показываем имя пользователя
        document.getElementById('currentUser').textContent = `👤 ${currentUser.name}`;
        
        // Показываем кнопку очистки только для админа
        if (currentUser.role === 'admin') {
            document.getElementById('adminOnlySection').style.display = 'block';
        }
        
        // Загружаем данные
        loadFromStorage();
        renderAll();
        updateSelects();
        
        loginError.textContent = '';
    } else {
        loginError.textContent = '❌ Неверный пароль!';
        passwordInput.value = '';
    }
}

// ===== ПРОВЕРКА СЕССИИ =====
function checkSession() {
    const savedUser = sessionStorage.getItem('gym_current_user');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        document.getElementById('currentUser').textContent = `👤 ${currentUser.name}`;
        
        if (currentUser.role === 'admin') {
            document.getElementById('adminOnlySection').style.display = 'block';
        }
        
        loadFromStorage();
        renderAll();
        updateSelects();
    }
}

// ===== ВЫХОД =====
function logout() {
    sessionStorage.removeItem('gym_current_user');
    currentUser = null;
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('passwordInput').value = '';
}

// ===== ПРОВЕРКА ПРАВ =====
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// ===== ЗАЩИТА ОПАСНЫХ ДЕЙСТВИЙ =====
function clearAllData() {
    if (!isAdmin()) {
        alert('⛔ Только администратор может очищать все данные!');
        return;
    }
    
    if (confirm('⚠️ ВНИМАНИЕ! Вы точно хотите удалить ВСЕ данные? Это действие нельзя отменить!')) {
        clients = [];
        trainers = [];
        sessions = [];
        saveToStorage();
        renderAll();
        updateCounters();
        alert('Все данные удалены');
    }
}

// Также защитим удаление тренеров (можно оставить менеджерам)
function deleteTrainer(id) {
    const trainer = trainers.find(t => t.id === id);
    if (!trainer) return;
    
    // Менеджеры не могут удалять тренеров
    if (!isAdmin()) {
        alert('⛔ Только администратор может удалять тренеров!');
        return;
    }
    
    const hasSessions = sessions.some(s => s.trainerId === id);
    if (hasSessions) {
        if (!confirm(`У тренера ${trainer.name} есть запланированные тренировки. Удалить тренера и все его тренировки?`)) {
            return;
        }
        sessions = sessions.filter(s => s.trainerId !== id);
    }
    
    trainers = trainers.filter(t => t.id !== id);
    saveToStorage();
    renderAll();
    updateSelects();
    updateCounters();
}

// Запускаем проверку сессии при загрузке
document.addEventListener('DOMContentLoaded', checkSession);

let clients = [];
let trainers = [];
let sessions = [];

// Цены на тренировки
const SPORT_PRICES = {
    'boxing': 600000, // 600 тыс сум
    'mma': 500000,     // 500 тыс сум
    'gym': 1200000     // 1 млн 200 тыс сум
};

const SPORT_NAMES = {
    'boxing': 'Бокс',
    'mma': 'ММА',
    'gym': 'Качалка'
};

// ===== ЗАГРУЗКА ИЗ LOCALSTORAGE =====
function loadFromStorage() {
    const savedClients = localStorage.getItem('gym_clients');
    const savedTrainers = localStorage.getItem('gym_trainers');
    const savedSessions = localStorage.getItem('gym_sessions');
    
    if (savedClients) clients = JSON.parse(savedClients);
    if (savedTrainers) trainers = JSON.parse(savedTrainers);
    if (savedSessions) sessions = JSON.parse(savedSessions);
}

// ===== СОХРАНЕНИЕ В LOCALSTORAGE =====
function saveToStorage() {
    localStorage.setItem('gym_clients', JSON.stringify(clients));
    localStorage.setItem('gym_trainers', JSON.stringify(trainers));
    localStorage.setItem('gym_sessions', JSON.stringify(sessions));
}

// ===== СЧЕТЧИКИ =====
function updateCounters() {
    const clientCount = document.getElementById('clientCount');
    const trainerCount = document.getElementById('trainerCount');
    const sessionCount = document.getElementById('sessionCount');
    
    if (clientCount) clientCount.textContent = clients.length;
    if (trainerCount) trainerCount.textContent = trainers.length;
    if (sessionCount) sessionCount.textContent = sessions.length;
}

// ===== ОЧИСТКА ВСЕХ ДАННЫХ =====
function clearAllData() {
    if (confirm('⚠️ ВНИМАНИЕ! Вы точно хотите удалить ВСЕ данные? Это действие нельзя отменить!')) {
        clients = [];
        trainers = [];
        sessions = [];
        saveToStorage();
        renderAll();
        updateCounters();
        alert('Все данные удалены');
    }
}

// ===== ФУНКЦИИ АДМИН-ПАНЕЛИ =====
function addClient() {
    const nameInput = document.getElementById('clientName');
    const phoneInput = document.getElementById('clientPhone');
    
    if (!nameInput || !phoneInput) return;
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    if (!name) return alert("Введите имя клиента!");
    if (!phone) return alert("Введите телефон клиента!");
    
    clients.push({ 
        id: Date.now() + Math.random(),
        name: name,
        phone: phone
    });
    
    nameInput.value = '';
    phoneInput.value = '';
    saveToStorage();
    renderClients();
    updateSelects();
    updateCounters();
}

function addTrainer() {
    const nameInput = document.getElementById('trainerName');
    const sportSelect = document.getElementById('trainerSport');
    
    if (!nameInput || !sportSelect) return;
    
    const name = nameInput.value.trim();
    const sport = sportSelect.value;
    
    if (!name) return alert("Введите имя тренера!");
    
    trainers.push({ 
        id: Date.now() + Math.random(),
        name: name,
        sport: sport,
        sportName: SPORT_NAMES[sport],
        price: SPORT_PRICES[sport]
    });
    
    nameInput.value = '';
    saveToStorage();
    renderTrainers();
    updateSelects();
    updateCounters();
}

// ===== ФУНКЦИИ УДАЛЕНИЯ =====
function deleteClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    const hasSessions = sessions.some(s => s.clientId === id);
    if (hasSessions) {
        if (!confirm(`У клиента ${client.name} есть записи на тренировки. Удалить клиента и все его записи?`)) {
            return;
        }
        sessions = sessions.filter(s => s.clientId !== id);
    }
    
    clients = clients.filter(c => c.id !== id);
    saveToStorage();
    renderAll();
    updateSelects();
    updateCounters();
}

function deleteTrainer(id) {
    const trainer = trainers.find(t => t.id === id);
    if (!trainer) return;
    
    const hasSessions = sessions.some(s => s.trainerId === id);
    if (hasSessions) {
        if (!confirm(`У тренера ${trainer.name} есть запланированные тренировки. Удалить тренера и все его тренировки?`)) {
            return;
        }
        sessions = sessions.filter(s => s.trainerId !== id);
    }
    
    trainers = trainers.filter(t => t.id !== id);
    saveToStorage();
    renderAll();
    updateSelects();
    updateCounters();
}

function deleteSession(id) {
    if (confirm('Отменить тренировку?')) {
        sessions = sessions.filter(s => s.id !== id);
        saveToStorage();
        renderSessions();
        updateCounters();
    }
}

// ===== ДОБАВЛЕНИЕ ТРЕНИРОВКИ =====
function addSession() {
    const clientSelect = document.getElementById('selectClient');
    const trainerSelect = document.getElementById('selectTrainer');
    const timeInput = document.getElementById('sessionTime');
    const paidCheckbox = document.getElementById('sessionPaid');

    if (!clientSelect || !trainerSelect || !timeInput) return;

    const clientId = clientSelect.value;
    const trainerId = trainerSelect.value;
    const time = timeInput.value;
    const paid = paidCheckbox ? paidCheckbox.checked : false;

    if (!clientId || !trainerId || !time) return alert("Заполните все поля!");

    const client = clients.find(c => c.id == clientId);
    const trainer = trainers.find(t => t.id == trainerId);
    
    if (!client || !trainer) return alert("Ошибка: клиент или тренер не найдены");

    sessions.push({ 
        id: Date.now() + Math.random(),
        clientId: clientId,
        trainerId: trainerId,
        clientName: client.name,
        trainerName: trainer.name,
        sport: trainer.sport,
        sportName: trainer.sportName,
        price: trainer.price,
        time: time,
        paid: paid,
        completed: false
    });
    
    timeInput.value = '';
    if (paidCheckbox) paidCheckbox.checked = false;
    
    saveToStorage();
    renderSessions();
    updateCounters();
}

// ===== РЕНДЕРИНГ =====
function renderClients() {
    const list = document.getElementById('clientList');
    if (!list) return;
    list.innerHTML = '';
    clients.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${c.name}</strong><br>
                <small>📞 ${c.phone}</small>
            </div>
            <div>
                <button onclick="editClient(${c.id})" style="background-color: #3498db;">✏️</button>
                <button onclick="deleteClient(${c.id})" style="background-color: #e74c3c;">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function renderTrainers() {
    const list = document.getElementById('trainerList');
    if (!list) return;
    list.innerHTML = '';
    trainers.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${t.name}</strong><br>
                <small>${t.sportName} - ${t.price.toLocaleString()} сум</small>
            </div>
            <div>
                <button onclick="editTrainer(${t.id})" style="background-color: #3498db;">✏️</button>
                <button onclick="deleteTrainer(${t.id})" style="background-color: #e74c3c;">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
}

function renderSessions() {
    const list = document.getElementById('sessionList');
    if (!list) return;
    
    // Получаем фильтры
    const filterTrainer = document.getElementById('filterTrainer');
    const filterPaid = document.getElementById('filterPaid');
    
    let filteredSessions = [...sessions];
    
    if (filterTrainer && filterTrainer.value) {
        filteredSessions = filteredSessions.filter(s => s.trainerId == filterTrainer.value);
    }
    
    if (filterPaid && filterPaid.value === 'paid') {
        filteredSessions = filteredSessions.filter(s => s.paid);
    } else if (filterPaid && filterPaid.value === 'unpaid') {
        filteredSessions = filteredSessions.filter(s => !s.paid);
    }
    
    // Сортируем по времени (сначала новые)
    filteredSessions.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    list.innerHTML = '';
    filteredSessions.forEach(s => {
        const li = document.createElement('li');
        const paidStatus = s.paid ? '✅ Оплачено' : '❌ Не оплачено';
        const date = new Date(s.time).toLocaleString('ru-RU');
        
        li.innerHTML = `
            <div>
                <strong>${s.clientName}</strong> с <strong>${s.trainerName}</strong><br>
                <small>${s.sportName} - ${s.price.toLocaleString()} сум</small><br>
                <small>📅 ${date}</small><br>
                <small>${paidStatus}</small>
            </div>
            <div>
                <button onclick="togglePaid(${s.id})" style="background-color: #f39c12;">💰</button>
                <button onclick="deleteSession(${s.id})" style="background-color: #e74c3c;">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// ===== ПЕРЕКЛЮЧЕНИЕ СТАТУСА ОПЛАТЫ =====
function togglePaid(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
        session.paid = !session.paid;
        saveToStorage();
        renderSessions();
    }
}

// ===== РЕДАКТИРОВАНИЕ =====
function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    const newName = prompt("Введите новое имя:", client.name);
    const newPhone = prompt("Введите новый телефон:", client.phone);
    
    if (newName && newName.trim()) client.name = newName.trim();
    if (newPhone && newPhone.trim()) client.phone = newPhone.trim();
    
    saveToStorage();
    renderClients();
    updateSelects();
}

function editTrainer(id) {
    const trainer = trainers.find(t => t.id === id);
    if (!trainer) return;
    
    const newName = prompt("Введите новое имя:", trainer.name);
    if (newName && newName.trim()) trainer.name = newName.trim();
    
    saveToStorage();
    renderTrainers();
    updateSelects();
}

// ===== ОБНОВЛЕНИЕ SELECT ЭЛЕМЕНТОВ =====
function updateSelects() {
    const clientSelect = document.getElementById('selectClient');
    const trainerSelect = document.getElementById('selectTrainer');
    const filterTrainer = document.getElementById('filterTrainer');

    if (!clientSelect || !trainerSelect) return;

    clientSelect.innerHTML = '<option value="">Выберите клиента</option>';
    trainerSelect.innerHTML = '<option value="">Выберите тренера</option>';
    
    if (filterTrainer) {
        filterTrainer.innerHTML = '<option value="">Все тренеры</option>';
    }

    clients.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = `${c.name} (${c.phone})`;
        clientSelect.appendChild(option);
    });

    trainers.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = `${t.name} - ${t.sportName}`;
        trainerSelect.appendChild(option);
        
        if (filterTrainer) {
            const filterOption = document.createElement('option');
            filterOption.value = t.id;
            filterOption.textContent = t.name;
            filterTrainer.appendChild(filterOption);
        }
    });
}

// ===== ОТОБРАЖЕНИЕ ЦЕНЫ =====
function updatePriceDisplay() {
    const trainerSelect = document.getElementById('selectTrainer');
    const priceDisplay = document.getElementById('priceDisplay');
    
    if (!trainerSelect || !priceDisplay) return;
    
    const trainerId = trainerSelect.value;
    if (trainerId) {
        const trainer = trainers.find(t => t.id == trainerId);
        if (trainer) {
            priceDisplay.innerHTML = `Стоимость: <span style="color: #27ae60; font-weight: bold;">${trainer.price.toLocaleString()} сум</span>`;
        }
    } else {
        priceDisplay.innerHTML = 'Стоимость: <span>0 сум</span>';
    }
}

// ===== ФИЛЬТРЫ =====
function applyFilters() {
    renderSessions();
}

function resetFilters() {
    const filterTrainer = document.getElementById('filterTrainer');
    const filterPaid = document.getElementById('filterPaid');
    
    if (filterTrainer) filterTrainer.value = '';
    if (filterPaid) filterPaid.value = 'all';
    
    renderSessions();
}

// ===== ОБНОВЛЕНИЕ ВСЕГО =====
function renderAll() {
    renderClients();
    renderTrainers();
    renderSessions();
    updateCounters();
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
loadFromStorage();

// Добавляем слушатель для обновления цены при выборе тренера
document.addEventListener('DOMContentLoaded', function() {
    const trainerSelect = document.getElementById('selectTrainer');
    if (trainerSelect) {
        trainerSelect.addEventListener('change', updatePriceDisplay);
    }
    
    updateSelects();
    renderAll();
});