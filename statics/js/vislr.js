
// run it when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    handleAuthorization();
    set_hover_events();
});

var datadict={}
var timeout = 0;


// runs through oauth process + fetches data
async function handleAuthorization() {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get('code');

    if (getAccessToken() != null){
        fetchActivities();
    }
    else {
        if (code) {
            await exchangeCodeForToken(code);
        } else {
            window.location.href = "http://localhost:5000/fp.html";
            // could be rate limit too...
        }
    }
}

async function exchangeCodeForToken(code) {
    const clientId = "126877";
    const clientSecret = "988cc2b69cdee2fc1da49deac39f4b9eee6a5bb3"; 
    const redirectUri = "http://localhost:5000/visualizer.html";

    const tokenUrl = 'https://www.strava.com/api/v3/oauth/token';

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
        })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('strava_access_token', data.access_token);
        fetchActivities();

    } else {

        // error exchanging. maybe make a new html file to redirect to?
        document.getElementById("title").textContent = "1not noice";

    }
}

async function fetchActivities() {
    fetchAthlete();
    const accessToken = getAccessToken();

    const params = new URLSearchParams({
        'per_page': 200,
        'after': 1704110400
    });
    
    const url = `https://www.strava.com/api/v3/athlete/activities?${params}`;


    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });


    if (response.ok) {
        const activities = await response.json();
        store_activities(activities);
    } else {
        console.error('Error fetching activities:', response.statusText);
    }
}

function store_activities(activities) {
    let total_elapsed_time = 0;
    let total_meters = 0;
    let i = 0;

    activities.forEach(activity => {
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
        i++;

    })

    color_activities(total_meters, total_elapsed_time);
}

function color_activities(total_meters, total_elapsed_time){
    const elements = Array.from(document.querySelectorAll('.days'));


    let todaysDate = new Date();
    let todaysKey = convertToKey(todaysDate);

    let ran_streak = 0;
    let miss_streak = 0;
    let ran_counter = 0;
    let miss_counter = 0;

    

    for (let i = 0; i < elements.length; i++){   
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
    display_stats_data(total_meters, total_elapsed_time, ran_streak, miss_streak);


}

async function fetchAthlete() {
    const accessToken = getAccessToken();

    const response = await fetch('https://www.strava.com/api/v3/athlete', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.ok) {
        const athlete = await response.json();
        let name = athlete.firstname + " " + athlete.lastname;
        let pfp_url = athlete.profile;
        
        document.getElementById('username').textContent = name;
        document.getElementById('userpfp').src = pfp_url;

    } else {
        console.error('Error fetching athlete:', response.statusText);
    }
}

// hover functions
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

        let elapsed_time_in_sec = datadict[currentDayID][0]['elapsed_time'];

        let distance_miles = datadict[currentDayID][0]['distance'] / 1600;
        let distance_km = datadict[currentDayID][0]['distance'] / 1000;

        childDivs[0].textContent = datadict[currentDayID][0]['date'];
        childDivs[1].textContent = (distance_miles).toFixed(2) + " miles / " + (distance_km).toFixed(2) + " km";
        childDivs[2].textContent = calculatePace(elapsed_time_in_sec, distance_miles) + " / " + calculatePace(elapsed_time_in_sec, distance_km);

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



// helper methods
function convertToKey(date){
    let month = (date.getMonth() + 1).toString(); 
    let day = date.getDate().toString();
    let key = "M" + month + "_D" + day;
    return key;
}
function getAccessToken() {
    return localStorage.getItem('strava_access_token');
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


// side bar functions
function toggleSideTab() {
    var stats_tab = document.getElementById("stats_tab_id");
    stats_tab.classList.toggle('open');
}
function display_stats_data(total_meters, total_elapsed_time, ran_streak, miss_streak){
    document.getElementById('stattxt_distance').textContent 
    += Math.round(total_meters/1600) + " miles / " + Math.round(total_meters/1000) + " km";

    document.getElementById('stattxt_time').textContent
    += Math.round(total_elapsed_time/3600) + " hours, " + Math.round(total_elapsed_time % 60) + " min spent running";

    document.getElementById('stattxt_ran_streak').textContent += ran_streak + " days";
    document.getElementById('stattxt_miss_streak').textContent += miss_streak + " days";
}
function calculatePace(elapsedTimeInSeconds, distance) {
    // Convert elapsed time from seconds to minutes
    let elapsedTimeInMinutes = elapsedTimeInSeconds / 60;
    
    // Calculate pace in minutes per mile
    let paceInMinutesPerMile = elapsedTimeInMinutes / distance;
    
    // Convert pace to minutes and seconds
    let totalSeconds = paceInMinutesPerMile * 60;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.round(totalSeconds % 60);
    
    // Ensure seconds are always displayed with two digits
    let formattedSeconds = String(seconds).padStart(2, '0');
    
    return `${minutes}:${formattedSeconds}`;
}