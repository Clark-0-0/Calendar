// Состояние приложения
let users = JSON.parse(localStorage.getItem('shift_users')) || [];
let currentDate = new Date();
let selectedUserIndicesForCompare = JSON.parse(localStorage.getItem('shift_selected_compare')) || [];

// DOM Элементы
const usersListEl = document.getElementById('users-list');
const profileForm = document.getElementById('profile-form');
const usernameInput = document.getElementById('username');
const scheduleTypeSelect = document.getElementById('schedule-type');
const startDateInput = document.getElementById('start-date');
const editIndexInput = document.getElementById('edit-index');
const saveBtn = document.getElementById('save-btn');
const cancelEditBtn = document.getElementById('cancel-edit');

const monthSelectEl = document.getElementById('month-select');
const yearSelectEl = document.getElementById('year-select');
const calendarDaysEl = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const todayBtn = document.getElementById('today-btn');

const compareCheckboxesEl = document.getElementById('compare-checkboxes');
const matchResultsEl = document.getElementById('match-results');
const selectAllBtn = document.getElementById('select-all-btn');

const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');

// Установка даты по умолчанию сегодняшней в форме
startDateInput.valueAsDate = new Date();

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderUsers();
    renderCalendar();
    setupEventListeners();
});

function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });

    monthSelectEl.addEventListener('change', (e) => {
        currentDate.setMonth(parseInt(e.target.value));
        renderCalendar();
    });

    yearSelectEl.addEventListener('change', (e) => {
        currentDate.setFullYear(parseInt(e.target.value));
        renderCalendar();
    });

    profileForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);

    exportBtn.addEventListener('click', exportData);
    importFile.addEventListener('change', importData);
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', toggleSelectAllUsers);
    }
}

// ==========================================
// ЛОГИКА ГРАФИКОВ РАБОТЫ
// ==========================================
function getShiftForDate(user, targetDate) {
    const [startYear, startMonth, startDay] = user.startDate.split('-').map(Number);
    const startUTC = Date.UTC(startYear, startMonth - 1, startDay);
    
    const targetUTC = Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const diffTime = targetUTC - startUTC;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'none', label: 'До старта', isWeekend: false };

    let cycleDay = diffDays % 15;

    switch (user.scheduleType) {
        case '2-2-complex':
            let cycle22 = diffDays % 4;
            if (cycle22 === 0) return { type: 'work', label: 'День (08:00 - 20:00)', isWeekend: false };
            if (cycle22 === 1) return { type: 'night', label: 'Ночь (20:00 - 08:00)', isWeekend: false };
            if (cycle22 === 2) return { type: 'rest', label: 'Отсыпной', isWeekend: true }; // Отсыпной считается выходным
            return { type: 'weekend', label: 'Выходной', isWeekend: true };

        case '1-3':
            let cycle13 = diffDays % 4;
            if (cycle13 === 0) return { type: 'work', label: 'Сутки', isWeekend: false };
            if (cycle13 === 1) return { type: 'rest', label: 'Отсыпной', isWeekend: true }; // Отсыпной считается выходным
            return { type: 'weekend', label: 'Выходной', isWeekend: true };

        case '3-2-complex':
            if (cycleDay >= 0 && cycleDay <= 2) return { type: 'work', label: 'Утро (08-16)', isWeekend: false };
            if (cycleDay === 3 || cycleDay === 4) return { type: 'weekend', label: 'Выходной', isWeekend: true };
            if (cycleDay >= 5 && cycleDay <= 7) return { type: 'work', label: 'Вечер (16-00)', isWeekend: false };
            if (cycleDay === 8) return { type: 'weekend', label: 'Выходной', isWeekend: true };
            if (cycleDay >= 9 && cycleDay <= 11) return { type: 'night', label: 'Ночь (00-08)', isWeekend: false };
            if (cycleDay === 12) return { type: 'rest', label: 'Отсыпной', isWeekend: true }; // Отсыпной считается выходным
            return { type: 'weekend', label: 'Выходной', isWeekend: true };

        default:
            return { type: 'none', label: '-', isWeekend: false };
    }
}

function getScheduleName(type) {
    switch(type) {
        case '2-2-complex': return '2/2 (День, Ночь, Отс, Вых)';
        case '1-3': return '1/3 (Сутки, Отс, 2 Вых)';
        case '3-2-complex': return 'Сложный 3/2';
        default: return type;
    }
}

// ==========================================
// УПРАВЛЕНИЕ ПРОФИЛЯМИ (CRUD)
// ==========================================
function handleFormSubmit(e) {
    e.preventDefault();
    const name = usernameInput.value.trim();
    const scheduleType = scheduleTypeSelect.value;
    const startDate = startDateInput.value;
    const editIndex = editIndexInput.value;

    if (!name || !startDate) return;

    const userData = { name, scheduleType, startDate };

    if (editIndex === "") {
        users.push(userData);
    } else {
        users[editIndex] = userData;
        resetForm();
    }

    saveAndRefresh();
    profileForm.reset();
    startDateInput.valueAsDate = new Date();
}

function editUser(index) {
    const user = users[index];
    usernameInput.value = user.name;
    scheduleTypeSelect.value = user.scheduleType;
    startDateInput.value = user.startDate;
    editIndexInput.value = index;
    saveBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Обновить';
    cancelEditBtn.style.display = 'block';
}

function deleteUser(index) {
    users.splice(index, 1);
    selectedUserIndicesForCompare = selectedUserIndicesForCompare.filter(i => i !== index);
    localStorage.setItem('shift_selected_compare', JSON.stringify(selectedUserIndicesForCompare));
    saveAndRefresh();
}

function resetForm() {
    profileForm.reset();
    editIndexInput.value = "";
    saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Сохранить';
    cancelEditBtn.style.display = 'none';
    startDateInput.valueAsDate = new Date();
}

function saveAndRefresh() {
    localStorage.setItem('shift_users', JSON.stringify(users));
    renderUsers();
    renderCalendar();
}

// ==========================================
// ОТРИСОВКА ИНТЕРФЕЙСА
// ==========================================
function renderUsers() {
    usersListEl.innerHTML = '';
    if (users.length === 0) {
        usersListEl.innerHTML = '<p class="hint">Нет добавленных пользователей</p>';
    } else {
        users.forEach((user, index) => {
            const item = document.createElement('div');
            item.className = 'user-item';
            item.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${escapeHtml(user.name)}</span>
                    <span class="user-schedule">${getScheduleName(user.scheduleType)}</span>
                </div>
                <div class="user-actions">
                    <button class="icon-btn" onclick="editUser(${index})" title="Редактировать"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" onclick="deleteUser(${index})" title="Удалить"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            usersListEl.appendChild(item);
        });
    }

    compareCheckboxesEl.innerHTML = '';
    if (users.length === 0) {
        compareCheckboxesEl.innerHTML = '<p class="hint">Сначала добавьте пользователей</p>';
        matchResultsEl.innerHTML = 'Нет данных для сравнения.';
        return;
    }

    users.forEach((user, index) => {
        const isChecked = selectedUserIndicesForCompare.includes(index);
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        label.innerHTML = `
            <input type="checkbox" value="${index}" ${isChecked ? 'checked' : ''} onchange="toggleCompareUser(${index})">
            <span>${escapeHtml(user.name)}</span>
        `;
        compareCheckboxesEl.appendChild(label);
    });

    calculateMatches();
}

function toggleCompareUser(index) {
    if (selectedUserIndicesForCompare.includes(index)) {
        selectedUserIndicesForCompare = selectedUserIndicesForCompare.filter(i => i !== index);
    } else {
        selectedUserIndicesForCompare.push(index);
    }
    localStorage.setItem('shift_selected_compare', JSON.stringify(selectedUserIndicesForCompare));
    renderCalendar();
    calculateMatches();
}

function toggleSelectAllUsers() {
    if (selectedUserIndicesForCompare.length === users.length) {
        selectedUserIndicesForCompare = [];
    } else {
        selectedUserIndicesForCompare = users.map((_, index) => index);
    }
    localStorage.setItem('shift_selected_compare', JSON.stringify(selectedUserIndicesForCompare));
    renderUsers();
    renderCalendar();
}

// ==========================================
// КАЛЕНДАРЬ И СОВПАДЕНИЯ
// ==========================================
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthSelectEl.value = month;
    populateYearSelect(year);

    calendarDaysEl.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const offset = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const todayStr = new Date().toDateString();
    const sharedWeekendDates = getSharedWeekendsDates(year, month);

    for (let i = offset - 1; i >= 0; i--) {
        const dayNum = prevTotalDays - i;
        const cellDate = new Date(year, month - 1, dayNum);
        createDayCell(cellDate, true, todayStr, sharedWeekendDates);
    }

    for (let i = 1; i <= totalDays; i++) {
        const cellDate = new Date(year, month, i);
        createDayCell(cellDate, false, todayStr, sharedWeekendDates);
    }

    const totalRenderedCells = offset + totalDays;
    const nextDaysCount = (totalRenderedCells % 7 === 0) ? 0 : 7 - (totalRenderedCells % 7);
    for (let i = 1; i <= nextDaysCount; i++) {
        const cellDate = new Date(year, month + 1, i);
        createDayCell(cellDate, true, todayStr, sharedWeekendDates);
    }

    calculateMatches();
}

function populateYearSelect(currentYear) {
    yearSelectEl.innerHTML = '';
    const startYear = currentYear - 10;
    const endYear = currentYear + 15;

    for (let y = startYear; y <= endYear; y++) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        if (y === currentYear) {
            option.selected = true;
        }
        yearSelectEl.appendChild(option);
    }
}

function createDayCell(dateObj, isOtherMonth, todayStr, sharedWeekendDates) {
    const cell = document.createElement('div');
    cell.className = `calendar-day ${isOtherMonth ? 'other-month' : ''}`;
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    if (dateObj.toDateString() === todayStr) {
        cell.classList.add('today');
    }

    if (sharedWeekendDates.has(dateString)) {
        cell.classList.add('shared-match');
    }

    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.innerHTML = `<span class="day-number">${dateObj.getDate()}</span>`;
    cell.appendChild(dayHeader);

    const shiftsContainer = document.createElement('div');
    shiftsContainer.className = 'shifts-container';

    // Показываем смены ТОЛЬКО выбранных для сравнения пользователей
    users.forEach((user, userIndex) => {
        if (selectedUserIndicesForCompare.includes(userIndex)) {
            const shift = getShiftForDate(user, dateObj);
            if (shift.type !== 'none') {
                const badge = document.createElement('div');
                badge.className = `shift-badge ${shift.type}`;
                badge.innerHTML = `<span><strong>${escapeHtml(user.name)}:</strong> ${shift.label}</span>`;
                shiftsContainer.appendChild(badge);
            }
        }
    });

    cell.appendChild(shiftsContainer);
    calendarDaysEl.appendChild(cell);
}

function getSharedWeekendsDates(year, month) {
    const sharedDates = new Set();
    if (selectedUserIndicesForCompare.length === 0) return sharedDates;

    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= totalDays; i++) {
        const dateObj = new Date(year, month, i);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        const dateString = `${y}-${m}-${d}`;

        let allAreFree = true;
        for (let userIdx of selectedUserIndicesForCompare) {
            const user = users[userIdx];
            const shift = getShiftForDate(user, dateObj);
            if (!shift.isWeekend) {
                allAreFree = false;
                break;
            }
        }

        if (allAreFree) {
            sharedDates.add(dateString);
        }
    }

    return sharedDates;
}

function calculateMatches() {
    if (selectedUserIndicesForCompare.length === 0) {
        matchResultsEl.innerHTML = 'Выберите хотя бы одного пользователя.';
        return;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const sharedDates = getSharedWeekendsDates(year, month);

    if (sharedDates.size === 0) {
        matchResultsEl.innerHTML = 'В текущем месяце совпадений нет.';
        return;
    }

    const sortedDates = Array.from(sharedDates).sort();
    let titleText = selectedUserIndicesForCompare.length === 1 ? 'Выходные дни:' : `Общие совпадения (${sortedDates.length}):`;
    
    let html = `<strong>${titleText}</strong><br><ul>`;
    
    sortedDates.forEach(dateStr => {
        const parts = dateStr.split('-');
        html += `<li>${parts[2]}.${parts[1]}.${parts[0]}</li>`;
    });
    html += '</ul>';

    matchResultsEl.innerHTML = html;
}

// ==========================================
// ЭКСПОРТ И ИМПОРТ
// ==========================================
function exportData() {
    if (users.length === 0) {
        alert('Нет данных для экспорта.');
        return;
    }

    try {
        const dataStr = JSON.stringify(users, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
        
        const downloadAnchor = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        downloadAnchor.setAttribute('href', url);
        downloadAnchor.setAttribute('download', `shift_calendar_data_${new Date().toISOString().slice(0,10)}.json`);
        
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        
        setTimeout(() => {
            document.body.removeChild(downloadAnchor);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        alert('Не удалось экспортировать данные.');
    }
}

function importData(event) {
    const fileReader = new FileReader();
    if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = (e) => {
            try {
                const importedUsers = JSON.parse(e.target.result);
                if (Array.isArray(importedUsers)) {
                    users = importedUsers;
                    selectedUserIndicesForCompare = [];
                    localStorage.removeItem('shift_selected_compare');
                    saveAndRefresh();
                    alert('Данные успешно импортированы!');
                } else {
                    alert('Ошибка: Неверный формат файла.');
                }
            } catch (error) {
                alert('Ошибка при чтении файла JSON.');
            }
            importFile.value = '';
        };
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}