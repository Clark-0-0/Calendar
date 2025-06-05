// Константы и глобальные переменные
const SCHEDULE_TYPES = {
  '2/2': { workDays: 2, offDays: 2 },
  '3/2': { workDays: 3, offDays: 2 },
  '1/3': { workDays: 1, offDays: 3 }
};

const SHIFT_NAMES = {
  1: "утро\nс 8:00 до 16:00",
  2: "вечер\nс 16:00 до 00:00",
  3: "ночь\nс 00:00 до 8:00",
  4: "сутки",
  5: "день",
  6: "выходной",
  7: "ночь"
};

const DAY_NAMES = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

let data_name_schedule = {};
let global_month = new Date().getMonth();
let currentYear = new Date().getFullYear();

// DOM элементы
const calendarElement = document.getElementById('calendar');
const monthTitleElement = document.getElementById('monthTitle');
const fileInput = document.getElementById('hiddenFileInput');
const dateInput = document.getElementById('add_date');

// Инициализация
dateInput.value = new Date().toISOString().slice(0, 10);
read_data();

// Основные функции
function generateCalendar(user_id) {
  const userData = data_name_schedule[user_id];
  if (!userData) return;

  const { date, schedule } = userData;
  const { workDays, offDays } = SCHEDULE_TYPES[schedule] || { workDays: 0, offDays: 0 };
  
  const [year, month, day] = date.split('-').map(Number);
  userData.month_count = {};

  let workingDayCounter = 0;
  let workingDayCounter3to2 = 0;

  for (let m = month - 1; m < 12; m++) {
    userData.month_count[m] = {};
    const daysInMonth = new Date(year, m + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      userData.month_count[m][d] = {};
      
      if (d >= day || m > month - 1) {
        if (workingDayCounter < workDays) {
          userData.month_count[m][d].style = "work";
          workingDayCounter++;
          
          if (schedule === "2/2") {
            workingDayCounter3to2 = (workingDayCounter3to2 % 2) + 1;
            userData.month_count[m][d].name_day = workingDayCounter3to2 === 1 ? 
              SHIFT_NAMES[5] : SHIFT_NAMES[7];
          } 
          else if (schedule === "3/2") {
            workingDayCounter3to2 = (workingDayCounter3to2 % 9) + 1;
            userData.month_count[m][d].name_day = 
              workingDayCounter3to2 < 4 ? SHIFT_NAMES[1] :
              workingDayCounter3to2 < 7 ? SHIFT_NAMES[2] : SHIFT_NAMES[3];
          }
          else if (schedule === "1/3") {
            userData.month_count[m][d].name_day = SHIFT_NAMES[4];
          }
        } else {
          userData.month_count[m][d].style = "off";
          userData.month_count[m][d].name_day = SHIFT_NAMES[6];
          workingDayCounter = workingDayCounter >= workDays + offDays - 1 ? 0 : workingDayCounter + 1;
        }
      } else {
        userData.month_count[m][d] = "day";
      }
    }
  }
}

function createCalendar() {
  const user_id = document.getElementById('names').value;
  const userData = data_name_schedule[user_id];
  if (!userData) return;

  const [year, month] = userData.date.split('-').map(Number);
  const firstDay = new Date(year, global_month, 1).getDay();

  // Очистка календаря
  calendarElement.innerHTML = '';
  
  // Заголовки дней недели
  DAY_NAMES.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    dayDiv.textContent = day;
    calendarElement.appendChild(dayDiv);
  });

  // Пустые ячейки перед первым днем месяца
  for (let i = 0; i < (firstDay + 6) % 7; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.classList.add('day');
    calendarElement.appendChild(emptyDiv);
  }

  // Дни месяца
  for (const day in userData.month_count[global_month]) {
    const dayData = userData.month_count[global_month][day];
    if (typeof dayData === 'string') continue;

    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day', dayData.style);
    
    // Проверка совпадений выходных дней
    const activeUsers = Object.values(data_name_schedule).filter(u => u.schedule_state);
    const isCoincidence = activeUsers.length > 1 && 
      activeUsers.every(u => u.month_count[global_month]?.[day]?.style === "off");
    
    if (isCoincidence) {
      dayDiv.classList.add('coincidence');
      dayDiv.textContent = `${day}\n${dayData.name_day}\nсовпадение`;
    } else {
      dayDiv.textContent = `${day}\n${dayData.name_day}`;
    }
    
    calendarElement.appendChild(dayDiv);
  }

  // Обновление заголовка месяца
  monthTitleElement.textContent = `${new Intl.DateTimeFormat('ru-RU', { month: 'long' })
    .format(new Date(year, global_month))} ${year}`;
}

function updateCalendar() {
  global_month = new Date().getMonth();
  const usersSelect = document.getElementById('names');
  
  usersSelect.innerHTML = '';
  for (const user_id in data_name_schedule) { 
    data_name_schedule[user_id].month_count = {};
    const option = new Option(data_name_schedule[user_id].name, user_id);
    usersSelect.add(option);
    generateCalendar(user_id);
  }
  
  createCalendar();
}

// Функции для работы с UI
function addUserRow(user_id, userData) {
  const table = document.getElementById('users').querySelector('tbody');
  const row = document.createElement('tr');
  row.dataset.id = user_id;

  // Имя
  const nameCell = document.createElement('th');
  nameCell.textContent = userData.name;
  row.appendChild(nameCell);

  // Дата
  const dateCell = document.createElement('td');
  dateCell.textContent = userData.date;
  row.appendChild(dateCell);

  // График
  const scheduleCell = document.createElement('td');
  scheduleCell.textContent = userData.schedule;
  row.appendChild(scheduleCell);

  // Чекбокс активности
  const checkboxCell = document.createElement('td');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = userData.schedule_state;
  checkbox.style.margin = '0';
  checkbox.addEventListener('change', () => {
    userData.schedule_state = checkbox.checked;
    write_data();
    updateCalendar();
  });
  checkboxCell.appendChild(checkbox);
  row.appendChild(checkboxCell);

  // Кнопка удаления
  const deleteCell = document.createElement('td');
  const deleteButton = document.createElement('input');
  deleteButton.type = 'button';
  deleteButton.value = 'Удалить';
  deleteButton.style.margin = '0';
  deleteButton.addEventListener('click', () => {
    delete data_name_schedule[user_id];
    row.remove();
    if (Object.keys(data_name_schedule).length === 0) {
      calendarElement.innerHTML = '';
    }
    write_data();
    updateCalendar();
  });
  deleteCell.appendChild(deleteButton);
  row.appendChild(deleteCell);

  table.appendChild(row);
}

function add_user() {
  const name = document.getElementById("add_name").value.trim();
  const date = document.getElementById("add_date").value;
  const schedule = document.getElementById("add_schedule").value;

  if (!name || !date || !schedule) return;

  const user_id = Date.now();
  const userData = {
    name,
    date,
    schedule,
    month_count: {},
    schedule_state: true
  };

  data_name_schedule[user_id] = userData;
  addUserRow(user_id, userData);

  // Сброс формы
  document.getElementById("add_name").value = "";
  document.getElementById("add_date").value = new Date().toISOString().slice(0, 10);
  
  write_data();
  updateCalendar();
}

// Функции для работы с данными
function export_data() {
  const dataStr = JSON.stringify(data_name_schedule, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'work_schedule.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function import_data() {
  fileInput.click();
}

function read_function() {
  fileInput.addEventListener('change', () => {
    if (!fileInput.files.length) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && typeof importedData === 'object') {
          data_name_schedule = importedData;
          updateImport();
          write_data();
        }
      } catch (err) {
        console.error('Ошибка при чтении файла:', err);
      }
    };
    reader.readAsText(fileInput.files[0]);
  });
}

function updateImport() {
  const table = document.getElementById('users').querySelector('tbody');
  table.innerHTML = '';
  
  for (const user_id in data_name_schedule) {
    addUserRow(user_id, data_name_schedule[user_id]);
  }
  
  updateCalendar();
}

// Функции для работы с localStorage
function write_data() {
  localStorage.setItem('data_name_schedule', JSON.stringify(data_name_schedule));
}

function read_data() {
  const storedData = localStorage.getItem('data_name_schedule');
  if (!storedData) return;

  try {
    data_name_schedule = JSON.parse(storedData);
    updateImport();
  } catch (err) {
    console.error('Ошибка при чтении данных:', err);
  }
}

// Навигация по месяцам
function nextMonth() {
  global_month = (global_month + 1) % 12;
  if (global_month === 0) currentYear++;
  createCalendar();
}

function previousMonth() {
  global_month = (global_month - 1 + 12) % 12;
  if (global_month === 11) currentYear--;
  createCalendar();
}

// Инициализация переключателя таблицы
function initTableToggle() {
  const userListHeader = document.querySelector('.user-list h2');
  const userListSection = document.querySelector('.user-list');
  
  userListHeader.addEventListener('click', () => {
    userListSection.classList.toggle('collapsed');
    const icon = userListHeader.querySelector('.toggle-icon');
    if (userListSection.classList.contains('collapsed')) {
      icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
    } else {
      icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
    }
  });
}

// Оптимизация для мобильных устройств
function optimizeForMobile() {
  // Увеличиваем область клика для кнопок
  document.querySelectorAll('.btn').forEach(btn => {
    btn.style.minHeight = '44px';
  });
  
  // Оптимизация ввода даты
  if ('ontouchstart' in window) {
    dateInput.type = 'date';
  } else {
    dateInput.type = 'text';
    dateInput.addEventListener('focus', () => {
      dateInput.type = 'date';
    });
  }
  
  // Улучшение таблицы для мобильных
  const tableContainer = document.querySelector('.table-container');
  tableContainer.style.overflowX = 'auto';
  tableContainer.style.webkitOverflowScrolling = 'touch';
}

// Вызываем при загрузке
document.addEventListener('DOMContentLoaded', () => {
  optimizeForMobile();
  initTableToggle();
  read_function();
});