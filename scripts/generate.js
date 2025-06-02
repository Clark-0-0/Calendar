var data_name_schedule = {}

var grafik_name = {1:"утро\nс 8:00 до 16:00",2:"вечер\nс 16:00 до 00:00",3:"ночь\nс 00:00 до 8:00",4:"сутки",5:"день",6:"выходной",7:"ночь"}

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
console.log("test12433123")

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
                            data_name_schedule[data_name]["month_count"][i+month][days+1]["name_day"] = grafik_name[7]
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
