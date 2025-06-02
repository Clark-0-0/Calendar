var data_name_schedule = {}

var grafik_name = {1:"утро\nс 8:00 до 16:00",2:"вечер\nс 16:00 до 00:00",3:"ночь\nс 00:00 до 8:00",4:"сутки",5:"день",6:"выходной",7:"ночь"}

var day_name = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]
var global_month = new Date().getMonth();
document.getElementById("add_date").value = new Date().toISOString().slice(0, 10);

const calendarElement = document.getElementById('calendar'); // Получаем элемент для календаря
const monthTitleElement = document.getElementById('monthTitle'); // Получаем элемент для названия месяца

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let workingDayCounter = 0; // Счетчик рабочих дней
let workingDayCounter3to2 = 0; // Счетчик рабочих дней
let workDays, offDays; // Количество рабочих и выходных дней в графике

read_data()

function generateCalendar(user_id){
    workingDayCounter = 0;
    workingDayCounter3to2 = 0;
    var date = data_name_schedule[user_id]["date"];
    setSchedule(data_name_schedule[user_id]["schedule"]);
    const dateParts = date.split('-'); // Предполагаем формат YYYY-MM-DD
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Месяцы в JavaScript начинаются с 0
    const day = parseInt(dateParts[2], 10); // День




    // Обновляем текущий год и месяц
    currentYear = year;
    currentMonth = month;
    for (let i = 0; i < (12-month); i++) {
        //console.log(i+month)
        data_name_schedule[user_id]["month_count"][i+month] = {}
        //console.log(`${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(year, i+month))} ${year}`)
        const daysInMonth = new Date(year, month + i + 1, 0).getDate(); // Получаем количество дней в месяце
        for (let days = 0; days < daysInMonth; days++) {
            data_name_schedule[user_id]["month_count"][i+month][days+1] = {};
            //console.log(month,i+month)
            if (days + 1 >= day || month < i+month) {
                if (workingDayCounter < workDays) {
                    data_name_schedule[user_id]["month_count"][i+month][days+1]["style"] = "work"
                    workingDayCounter++; // Увеличиваем счетчик рабочих дней
                    
                    if (data_name_schedule[user_id]["schedule"] == "2/2"){
                        workingDayCounter3to2++;
                        if (workingDayCounter3to2 == 3){
                            workingDayCounter3to2 = 1
                        }
                        if (workingDayCounter3to2 == 1){
                            data_name_schedule[user_id]["month_count"][i+month][days+1]["name_day"] = grafik_name[5]
                        } else {
                            data_name_schedule[user_id]["month_count"][i+month][days+1]["name_day"] = grafik_name[7]
                        }
                    }
                    if (data_name_schedule[user_id]["schedule"] == "3/2"){
                        workingDayCounter3to2++;
                        if (workingDayCounter3to2 == 10){
                            workingDayCounter3to2 = 1
                        }
                        if (workingDayCounter3to2 < 4){
                            data_name_schedule[user_id]["month_count"][i+month][days+1]["name_day"] = grafik_name[1]
                        } else if (workingDayCounter3to2 < 7){
                            data_name_schedule[user_id]["month_count"][i+month][days+1]["name_day"] = grafik_name[2]
                        } else if (workingDayCounter3to2 < 10){
                            data_name_schedule[user_id]["month_count"][i+month][days+1]["name_day"] = grafik_name[3]
                        }
                    }
                    if (data_name_schedule[user_id]["schedule"] == "1/3"){
                        data_name_schedule[user_id]["month_count"][i+month][days+1]["name_day"] = grafik_name[4]
                    }
                } else {
                    data_name_schedule[user_id]["month_count"][i+month][days+1]["style"] = "off"
                    data_name_schedule[user_id]["month_count"][i+month][days+1]["name_day"] = grafik_name[6]
                    if (workingDayCounter >= workDays + offDays - 1) {
                        workingDayCounter = 0; // Сбрасываем счетчик после полного цикла
                        
                    } else {
                        workingDayCounter++; // Увеличиваем счетчик
                    }
                }
            } else {
                data_name_schedule[user_id]["month_count"][i+month][days+1] = "day"
            }
        }
    }
}



function createCalendar(){
    var user_id = document.getElementById('names').value;
    var date = data_name_schedule[user_id]["date"].toString()
    const dateParts = date.split('-'); // Предполагаем формат YYYY-MM-DD
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Месяцы в JavaScript начинаются с 0
    const day = parseInt(dateParts[2], 10); // День


    calendarElement.innerHTML = ''; // Очищаем предыдущий календарь

    var firstDay = new Date(year, global_month, 1).getDay(); // Получаем день недели для первого числа месяца
    console.log(firstDay,global_month)

    monthTitleElement.innerText = `${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(year, global_month))} ${year}`;
    for(let i = 0; i < 7; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day'); // Добавляем класс для стилей
        calendarElement.appendChild(emptyDiv); // Добавляем пустую ячейку в календарь
        emptyDiv.innerText = day_name[i]; 
    }


    for(let i = 0; i < (firstDay + 6) % 7; i++) {
        console.log("test ", i)
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day'); // Можно добавить класс для стилизации
        calendarElement.appendChild(emptyDiv);
    }

    for (const key in data_name_schedule[user_id]["month_count"][global_month]) {
        const dayDiv = document.createElement('div'); // Создаем элемент для дня
        dayDiv.classList.add('day');
        dayDiv.classList.add(data_name_schedule[user_id]["month_count"][global_month][key]["style"]); // Добавляем класс для стилей
        var coincidence = true;
        var num_schedule_state = 0
        for (const user_id in data_name_schedule) {
            if (data_name_schedule[user_id]["schedule_state"]){
                num_schedule_state += 1
                if (!(data_name_schedule[user_id]["month_count"][global_month][key]["style"] == "off")){
                    coincidence = false;
                    break
                }
            }
        }
        if (coincidence && num_schedule_state > 1){
            dayDiv.classList.add('coincidence');
            dayDiv.innerText = key + "\n" + data_name_schedule[user_id]["month_count"][global_month][key]["name_day"] + "\n совпадение"; // Устанавливаем текст в ячейку
        }else {
            dayDiv.innerText = key + "\n" + data_name_schedule[user_id]["month_count"][global_month][key]["name_day"]; // Устанавливаем текст в ячейку
        }
        calendarElement.appendChild(dayDiv); // Добавляем ячейку дня в календарь
    }
}



function updateCalendar() {
    global_month = new Date().getMonth();
    var users_name_id = document.getElementById('names')
    users_name_id.innerHTML = ""
    for (const user_id in data_name_schedule) { 
        data_name_schedule[user_id]["month_count"] = {}
        const option = document.createElement('option');
        option.value = user_id;
        option.textContent = data_name_schedule[user_id]["name"];
        users_name_id.appendChild(option)
        generateCalendar(user_id)
    }
    createCalendar()
}









function setSchedule(schedule) {
    if (schedule === '2/2') {
        workDays = 2;
        offDays = 2;
    } else if (schedule === '3/2') {
        workDays = 3;
        offDays = 2;
    } else if (schedule === '1/3') {
        workDays = 1;
        offDays = 3;
    } else {
        workDays = 0;
        offDays = 0;
    }
}
// Функция для определения, является ли день рабочим
function isWorkingDay(schedule, dayCounter) {
    if (schedule === '2/2') {
        console.log(dayCounter % 4 < 2,"test")
        return dayCounter % 4 < 2; // 2 рабочих, 2 выходных
    } else if (schedule === '3/2') {
        return dayCounter % 5 < 3; // 3 рабочих, 2 выходных
    } else if (schedule === '1/3') {
        return dayCounter % 4 < 1; // 1 рабочий, 3 выходных
    }
    return false; // Если график не распознан, возвращаем false
}
function nextMonth() {
    global_month++;
    if (global_month > 11) {
        global_month = 0;
        currentYear++;
    }
    createCalendar();
}

function previousMonth() {
    global_month--;
    if (global_month < 0) {
        global_month = 11;
        currentYear--;
    }
    createCalendar();
}


















function add_user() {
    const name = document.getElementById("add_name").value;
    const date = document.getElementById("add_date").value;
    const schedule = document.getElementById("add_schedule").value;

    if (name && date && schedule) {
        const table = document.getElementById('users');

        // Генерируем уникальный id на основе текущего времени
        const uniqueId = Date.now(); // число миллисекунд с 1970 года

        const dataItem = {"name":name, "date":date, "schedule":schedule, "month_count":{},"schedule_state":true};
        data_name_schedule[uniqueId] = dataItem

        const newRow = document.createElement('tr');

        // Связываем строку с id
        newRow.dataset.id = uniqueId;

        // Создаем ячейки
        const nameCell = document.createElement('th');
        nameCell.textContent = dataItem.name;

        const dateCell = document.createElement('td');
        dateCell.textContent = dataItem.date;

        const scheduleCell = document.createElement('td');
        scheduleCell.textContent = dataItem.schedule;

        // Кнопка "Редактировать"
        const CheckboxCell = document.createElement('td');
        const editCheckbox = document.createElement('input');
        editCheckbox.type = 'checkbox';
        editCheckbox.checked = dataItem.schedule_state
        editCheckbox.style.margin = '0px';

        editCheckbox.addEventListener('change', function() {
            const isChecked = this.checked; // текущее состояние
            const row = this.closest('tr');
            const id = row.dataset.id;

            // Обновляем данные или просто выводим в консоль
            if (data_name_schedule[id]) {
                // Например, сохраняем состояние в объекте:
                data_name_schedule[id].schedule_state = isChecked;
                updateCalendar() 
            }
        });

        CheckboxCell.appendChild(editCheckbox);

        // Кнопка "Удалить"
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('input');
        deleteButton.type = 'button';
        deleteButton.value = 'Удалить';
        deleteButton.style.margin = '0px';

        // Обработчик удаления
        deleteButton.addEventListener('click', function() {
            const rowToDelete = this.closest('tr');
            if (rowToDelete) {
                const rowToDelete = this.closest('tr');
                if (rowToDelete) {
                    const idToRemove = rowToDelete.dataset.id;
                    delete data_name_schedule[idToRemove]; // удаляем из объекта
                    rowToDelete.remove();
                    if ((!(Object.keys(data_name_schedule).length > 0))){
                        calendarElement.innerHTML = '';
                    }
                    updateCalendar()
                }
                rowToDelete.remove();
                console.log(data_name_schedule)
            }
        });

        deleteCell.appendChild(deleteButton);

        // Собираем строку
        newRow.appendChild(nameCell);
        newRow.appendChild(dateCell);
        newRow.appendChild(scheduleCell);
        newRow.appendChild(CheckboxCell);
        newRow.appendChild(deleteCell);

        // Добавляем строку в таблицу
        table.querySelector('tbody').appendChild(newRow);
        document.getElementById("add_date").value = new Date().toISOString().slice(0, 10);
        updateCalendar()
        document.getElementById("add_name").value = ""
        write_data()
    }




}


function remove_user(index) {
    
}

















































































function write_data() {
    localStorage.setItem('data_name_schedule', JSON.stringify(data_name_schedule));   
}

function read_data() {
    if (localStorage.getItem('data_name_schedule')) {
        data_name_schedule = JSON.parse(localStorage.getItem('data_name_schedule'));
        for (const user_id in data_name_schedule) {
            const table = document.getElementById('users');

            const newRow = document.createElement('tr');

            // Связываем строку с id
            newRow.dataset.id = user_id;

            // Создаем ячейки
            const nameCell = document.createElement('th');
            nameCell.textContent = data_name_schedule[user_id]["name"];

            const dateCell = document.createElement('td');
            dateCell.textContent = data_name_schedule[user_id]["date"];

            const scheduleCell = document.createElement('td');
            scheduleCell.textContent = data_name_schedule[user_id]["schedule"];

            // Кнопка "Редактировать"
            const CheckboxCell = document.createElement('td');
            const editCheckbox = document.createElement('input');
            editCheckbox.type = 'checkbox';
            editCheckbox.checked = data_name_schedule[user_id]["schedule_state"]
            editCheckbox.style.margin = '0px';

            editCheckbox.addEventListener('change', function() {
                const isChecked = this.checked; // текущее состояние
                const row = this.closest('tr');
                const id = row.dataset.id;

                // Обновляем данные или просто выводим в консоль
                if (data_name_schedule[id]) {
                    // Например, сохраняем состояние в объекте:
                    data_name_schedule[id].schedule_state = isChecked;
                    updateCalendar() 
                }
            });

            CheckboxCell.appendChild(editCheckbox);

            // Кнопка "Удалить"
            const deleteCell = document.createElement('td');
            const deleteButton = document.createElement('input');
            deleteButton.type = 'button';
            deleteButton.value = 'Удалить';
            deleteButton.style.margin = '0px';

            // Обработчик удаления
            deleteButton.addEventListener('click', function() {
                const rowToDelete = this.closest('tr');
                if (rowToDelete) {
                    const rowToDelete = this.closest('tr');
                    if (rowToDelete) {
                        const idToRemove = rowToDelete.dataset.id;
                        delete data_name_schedule[idToRemove]; // удаляем из объекта
                        rowToDelete.remove();
                        if ((!(Object.keys(data_name_schedule).length > 0))){
                            calendarElement.innerHTML = '';
                        }
                        updateCalendar()
                    }
                    rowToDelete.remove();
                    console.log(data_name_schedule)
                }
            });

            deleteCell.appendChild(deleteButton);

            // Собираем строку
            newRow.appendChild(nameCell);
            newRow.appendChild(dateCell);
            newRow.appendChild(scheduleCell);
            newRow.appendChild(CheckboxCell);
            newRow.appendChild(deleteCell);

            // Добавляем строку в таблицу
            table.querySelector('tbody').appendChild(newRow);
        }
        updateCalendar()
    }
}


