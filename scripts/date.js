var data_name_schedule = {
    "Clark":{
        "date":"21.03.2025",
        "schedule":"2/2",
        "month_count":{},
    },
    "Reklizon":{
        "date":"17.03.2025",
        "schedule":"3/2",
        "month_count":{},
    },
    "Diablo":{
        "date":"22.03.2025",
        "schedule":"1/3",
        "month_count":{},
    },
}

var grafik_name = {1:"утро",2:"вечер",3:"ночь",4:"сутки",5:"день",6:"выходной"}

var day_name = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]
var name_state = "Clark"
var global_month = new Date().getMonth();


const calendarElement = document.getElementById('calendar'); // Получаем элемент для календаря
const monthTitleElement = document.getElementById('monthTitle'); // Получаем элемент для названия месяца

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let workingDayCounter = 0; // Счетчик рабочих дней
let workingDayCounter3to2 = 0; // Счетчик рабочих дней
let workDays, offDays; // Количество рабочих и выходных дней в графике


function generateCalendar(data_name){
    workingDayCounter = 0;
    workingDayCounter3to2 = 0;
    var date = data_name_schedule[data_name]["date"]
    setSchedule(data_name_schedule[data_name]["schedule"])
    const dateParts = date.split('.'); // Предполагаем формат YYYY-MM-DD
    const year = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Месяцы в JavaScript начинаются с 0
    const day = parseInt(dateParts[0], 10); // День



    // Обновляем текущий год и месяц
    currentYear = year;
    currentMonth = month;
    for (let i = 0; i < (12-month); i++) {
        //console.log(i+month)
        data_name_schedule[data_name]["month_count"][i+month] = {}
        //console.log(`${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(year, i+month))} ${year}`)
        const daysInMonth = new Date(year, month + i + 1, 0).getDate(); // Получаем количество дней в месяце
        for (let days = 0; days < daysInMonth; days++) {
            data_name_schedule[data_name]["month_count"][i+month][days+1] = {};
            //console.log(month,i+month)
            if (days + 1 >= day || month < i+month) {
                if (workingDayCounter < workDays) {
                    data_name_schedule[data_name]["month_count"][i+month][days+1]["style"] = "work"
                    workingDayCounter++; // Увеличиваем счетчик рабочих дней
                    
                    if (data_name_schedule[data_name]["schedule"] == "2/2"){
                        workingDayCounter3to2++;
                        if (workingDayCounter3to2 == 3){
                            workingDayCounter3to2 = 1
                        }
                        if (workingDayCounter3to2 == 1){
                            data_name_schedule[data_name]["month_count"][i+month][days+1]["name_day"] = grafik_name[5]
                        } else {
                            data_name_schedule[data_name]["month_count"][i+month][days+1]["name_day"] = grafik_name[3]
                        }
                    }
                    if (data_name_schedule[data_name]["schedule"] == "3/2"){
                        workingDayCounter3to2++;
                        if (workingDayCounter3to2 == 10){
                            workingDayCounter3to2 = 1
                        }
                        if (workingDayCounter3to2 < 4){
                            data_name_schedule[data_name]["month_count"][i+month][days+1]["name_day"] = grafik_name[1]
                        } else if (workingDayCounter3to2 < 7){
                            data_name_schedule[data_name]["month_count"][i+month][days+1]["name_day"] = grafik_name[2]
                        } else if (workingDayCounter3to2 < 10){
                            data_name_schedule[data_name]["month_count"][i+month][days+1]["name_day"] = grafik_name[3]
                        }
                    }
                    if (data_name_schedule[data_name]["schedule"] == "1/3"){
                        data_name_schedule[data_name]["month_count"][i+month][days+1]["name_day"] = grafik_name[4]
                    }
                } else {
                    data_name_schedule[data_name]["month_count"][i+month][days+1]["style"] = "off"
                    data_name_schedule[data_name]["month_count"][i+month][days+1]["name_day"] = grafik_name[6]
                    if (workingDayCounter >= workDays + offDays - 1) {
                        workingDayCounter = 0; // Сбрасываем счетчик после полного цикла
                        
                    } else {
                        workingDayCounter++; // Увеличиваем счетчик
                    }
                }
            } else {
                data_name_schedule[data_name]["month_count"][i+month][days+1] = "day"
            }
        }
    }
}



function createCalendar(){
    name_state = document.getElementById('names').value;
    var date = data_name_schedule[name_state]["date"]
    const dateParts = date.split('.'); // Предполагаем формат YYYY-MM-DD
    const year = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Месяцы в JavaScript начинаются с 0
    const day = parseInt(dateParts[0], 10); // День

    calendarElement.innerHTML = ''; // Очищаем предыдущий календарь

    const firstDay = new Date(year, global_month, 1).getDay(); // Получаем день недели для первого числа месяца

    monthTitleElement.innerText = `${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(year, global_month))} ${year}`;
    for(let i = 0; i < 7; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day'); // Добавляем класс для стилей
        calendarElement.appendChild(emptyDiv); // Добавляем пустую ячейку в календарь
        emptyDiv.innerText = day_name[i]; 
    }


    for(let i = 1; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day'); // Добавляем класс для стилей
        calendarElement.appendChild(emptyDiv); // Добавляем пустую ячейку в календарь
    }


    for (const key in data_name_schedule[name_state]["month_count"][global_month]) {
        const dayDiv = document.createElement('div'); // Создаем элемент для дня
        dayDiv.classList.add('day');
        dayDiv.classList.add(data_name_schedule[name_state]["month_count"][global_month][key]["style"]); // Добавляем класс для стилей
        if (data_name_schedule["Clark"]["month_count"][global_month][key]["style"] == "off" && data_name_schedule["Reklizon"]["month_count"][global_month][key]["style"] == "off" && data_name_schedule["Diablo"]["month_count"][global_month][key]["style"] == "off") {
            dayDiv.classList.add('coincidence');
            dayDiv.innerText = key + "\n" + data_name_schedule[name_state]["month_count"][global_month][key]["name_day"] + "\n совпадение"; // Устанавливаем текст в ячейку
        } else {
            dayDiv.innerText = key + "\n" + data_name_schedule[name_state]["month_count"][global_month][key]["name_day"]; // Устанавливаем текст в ячейку
        }
        calendarElement.appendChild(dayDiv); // Добавляем ячейку дня в календарь
    }


}


generateCalendar("Clark")
generateCalendar("Reklizon")
generateCalendar("Diablo")
console.log(data_name_schedule)

createCalendar()



















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












// function createCalendar(year, month, startDay) {
//     calendarElement.innerHTML = ''; // Очищаем предыдущий календарь
//     const daysInMonth = new Date(year, month + 1, 0).getDate(); // Получаем количество дней в месяце
//     const firstDay = new Date(year, month, 1).getDay(); // Получаем день недели для первого числа месяца

//     // Добавляем пустые ячейки для дней до первого числа месяца
//     for(let i = 0; i < 7; i++) {
//         const emptyDiv = document.createElement('div');
//         emptyDiv.classList.add('day'); // Добавляем класс для стилей
//         calendarElement.appendChild(emptyDiv); // Добавляем пустую ячейку в календарь
//         emptyDiv.innerText = day_name[i]; 

//     }
//     for(let i = 1; i < firstDay; i++) {
//         const emptyDiv = document.createElement('div');
//         emptyDiv.classList.add('day'); // Добавляем класс для стилей
//         calendarElement.appendChild(emptyDiv); // Добавляем пустую ячейку в календарь
//     }

//     // Цикл для добавления дней в календарь
//     for(let day = 1; day <= daysInMonth; day++) {
//         const dayDiv = document.createElement('div'); // Создаем элемент для дня
//         dayDiv.classList.add('day'); // Добавляем класс для стилей
//         dayDiv.innerText = day; // Устанавливаем текст в ячейку

//         const date = new Date(year, month, day); // Создаем объект даты для текущего дня

//         // Проверяем, если дата больше или равна дате начала
//         if (date >= new Date(currentYear, currentMonth, 1)) {
//             // Определяем, является ли текущий день рабочим или выходным
//             if (workingDayCounter < workDays) {
//                 dayDiv.classList.add('work'); // Добавляем класс для рабочего дня
//                 workingDayCounter++; // Увеличиваем счетчик рабочих дней
//             } else {
//                 dayDiv.classList.add('off'); // Добавляем класс для выходного дня
//                 if (workingDayCounter >= workDays + offDays - 1) {
//                     workingDayCounter = 0; // Сбрасываем счетчик после полного цикла
//                 } else {
//                     workingDayCounter++; // Увеличиваем счетчик
//                 }
//             }
//         } else {
//             // Если дата меньше стартовой, просто добавляем ячейку без цвета
//             dayDiv.classList.add('day');
//         }

//         calendarElement.appendChild(dayDiv); // Добавляем ячейку дня в календарь
//     }

//     // Устанавливаем название месяца
//     monthTitleElement.innerText = `${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(year, month))} ${year}`;
// }


// // Пример установки графика
// setSchedule('2/2'); // Установите график перед созданием календаря
// createCalendar(currentYear, currentMonth, workingDayCounter);


// function updateCalendar() {
//     currentYear = new Date().getFullYear();
//     currentMonth = new Date().getMonth();
//     workingDayCounter = 0; // Счетчик рабочих дней
//     // Здесь вы можете добавить логику для обновления календаря
//     // Например, если у вас есть поле для ввода даты, вы можете получить его значение
//     const selectedDate = document.getElementById('startDateInput').value; // Предполагаем, что у вас есть input с id 'dateInput'
//     var schedules = document.getElementById('schedule').value;
//     setSchedule(schedules)
    
//     if (selectedDate) {
//         const dateParts = selectedDate.split('-'); // Предполагаем формат YYYY-MM-DD
//         const year = parseInt(dateParts[0], 10);
//         const month = parseInt(dateParts[1], 10) - 1; // Месяцы в JavaScript начинаются с 0

//         // Обновляем текущий год и месяц
//         currentYear = year;
//         currentMonth = month;

//         // Создаем календарь для выбранной даты
//         createCalendar(currentYear, currentMonth, workingDayCounter);
//     } else {
//         alert('Пожалуйста, выберите дату.');
//     }
// }


// // Инициализация календаря с текущими значениями
// createCalendar(currentYear, currentMonth, '2/2', new Date().toISOString().split('T')[0]);