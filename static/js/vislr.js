

var datadict={}
var timeout;


fetch_activities();
set_hover_events();
fetch_athlete();


function fetch_activities() {
    // sends a call
    fetch('/athlete/activities')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }
        
        return response.json();
    })
    .then(data => {
        // track total mileage
        let total_meters = 0;
        let total_elapsed_time = 0;

        // organize the data
        data.forEach(activity => { 
            let date = new Date(activity.start_date);
            let key = convertToKey(date);
            let formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

                
            if (!datadict[key]){
                datadict[key] = [];
            }
        
            
            datadict[key].push({
                'type': activity.type,
                'date': formattedDate,
                'distance': activity.distance,
                'elapsed_time': activity.elapsed_time,
                'start_time': activity.start_date_local
            });

            total_meters += activity.distance;
            total_elapsed_time += activity.elapsed_time;
            
        });        
        display_data(datadict, total_meters, total_elapsed_time);
    })
};

function display_data(datadict, total_meters, total_elapsed_time){
    const elements = Array.from(document.querySelectorAll('.days'));

    let todaysDate = new Date();
    let todaysKey = convertToKey(todaysDate);

    let ran_streak = 0;
    let miss_streak = 0;
    let ran_counter = 0;
    let miss_counter = 0;
    

    for(let i = 0; i < elements.length; i++){   
        const id = elements[i].id;
        let curr_day = document.getElementById(id);
        let avg_distance = total_meters / Object.keys(datadict).length;

        if (id == todaysKey){
            curr_day.style.borderColor = "#FF6E6E";
            break;
        }

        if (datadict[id]){  

            ran_counter++;
            miss_counter = 0;
            
            if(ran_counter > ran_streak){
                ran_streak = ran_counter;
            }

            let curr_distance = datadict[id][0]['distance'];
            let distance_factor = curr_distance / avg_distance;
            if (distance_factor < 0.8){
                curr_day.classList.add('green1');
            }
            else if (distance_factor < 0.9){
                curr_day.classList.add('green2');
            }
            else if (distance_factor < 1.0){
                curr_day.classList.add('green3');
            }
            else if (distance_factor < 1.1){
                curr_day.classList.add('green4');
            }
            else if (distance_factor < 1.2){
                curr_day.classList.add('green5');
            }
            else if (distance_factor < 1.3){
                curr_day.classList.add('green6');
            }
            else{
                curr_day.classList.add('green7');
            }
        }
        else{
            miss_counter++;
            ran_counter = 0;

            if(miss_counter > miss_streak){
                miss_streak = miss_counter;
            }

            curr_day.classList.add('missed');
        }
    }
    display_stats_data(total_meters, total_elapsed_time, ran_streak, miss_streak)

}

function display_stats_data(total_meters, total_elapsed_time, ran_streak, miss_streak){
    document.getElementById('stattxt_distance').textContent 
    += Math.round(total_meters/1600) + " miles / " + Math.round(total_meters/1000) + " km";

    document.getElementById('stattxt_time').textContent
    += Math.round(total_elapsed_time/3600) + " hours, " + Math.round(total_elapsed_time % 60) + " min spent running";

    document.getElementById('stattxt_ran_streak').textContent += ran_streak + " days";
    document.getElementById('stattxt_miss_streak').textContent += miss_streak + " days";
}


function fetch_athlete() {
    fetch('/athlete')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }
        
        return response.json();
    })
    .then(data => {
        let name = data.firstname + " " + data.lastname;
        let pfp_url = data.profile;

        document.getElementById('username').textContent = name;
        document.getElementById('userpfp').src = pfp_url;

    })
};

function set_hover_events(){
    var days = document.getElementsByClassName('days');
    for (var i = 0; i < days.length; i++) {
        days[i].addEventListener("mouseover", mouseover);
        days[i].addEventListener('mousemove', mousemove);
        days[i].addEventListener("mouseout", mouseout);
    }
}

function mouseover(event) {
    let currentDay = this;
    let currentDayID = currentDay.id;

    var moreInfoDiv = document.getElementById("moreinfodiv");
    var childDivs = moreInfoDiv.querySelectorAll("p");
    
    if (datadict[currentDayID] && datadict[currentDayID].length > 0) {
        let cursorX = event.clientX;
        let cursorY = event.clientY;

        moreInfoDiv.style.left = cursorX + 40 + 'px';
        moreInfoDiv.style.top = cursorY + + -70 + 'px';

        let elapsedTimeInMinutes = datadict[currentDayID][0]['elapsed_time'] / 60;
        let minutes = Math.floor(elapsedTimeInMinutes);
        let seconds = Math.floor((elapsedTimeInMinutes - minutes) * 60);
        let formattedSeconds = (seconds < 10 ? '0' : '') + seconds;
        let formattedTime = minutes + ':' + formattedSeconds + " min";

        childDivs[0].textContent = datadict[currentDayID][0]['date'];
        childDivs[1].textContent = (datadict[currentDayID][0]['distance'] / 1600).toFixed(2) + " miles"+ "\t" + "(" + formattedTime + ")";
        childDivs[2].textContent;

        timeout = setTimeout(function(){
        moreInfoDiv.style.opacity = '100'; 
        }, 350);
    } else {
        moreInfoDiv.style.opacity = '0';
    }
}

function mousemove(event){
    var moreInfoDiv = document.getElementById("moreinfodiv");
    moreInfoDiv.style.left = event.clientX + 40 + 'px';
    moreInfoDiv.style.top = event.clientY + + -70 + 'px';
}

function mouseout(){
    var moreInfoDiv = document.getElementById("moreinfodiv");
    moreInfoDiv.style.opacity = '0';
    clearTimeout(timeout);
}

function convertToKey(startDate){
    let month = (startDate.getMonth() + 1).toString(); 
    let day = startDate.getDate().toString();
    let key = "M" + month + "_D" + day;
    return key;
}

function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;

    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    remainingSeconds = (remainingSeconds < 10) ? '0' + remainingSeconds : remainingSeconds;

    return hours + ':' + minutes + ':' + remainingSeconds;
}

function toggleSideTab() {
    var stats_tab = document.getElementById("stats_tab_id");
    stats_tab.classList.toggle('open');
}