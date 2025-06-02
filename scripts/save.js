





function write(data_name_schedule) {
    localStorage.setItem('data_name_schedule', JSON.stringify(data_name_schedule));   
}

function read(params) {
    var data_name_schedule = JSON.parse(localStorage.getItem('data_name_schedule'));
    return data_name_schedule
}

function remove() {
    localStorage.removeItem('data_name_schedule');
}

