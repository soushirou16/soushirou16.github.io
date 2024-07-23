
document.addEventListener('DOMContentLoaded', function() {
    handleAuthorization();
    set_hover_events();
});

var datadict = {};
var timeout = 0;

async function handleAuthorization() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get('code');
    
    const accessToken = getAccessToken();

    if (accessToken) {
        fetchActivities();
    } else if (code) {
        await exchangeCodeForToken(code);
    }
}

async function exchangeCodeForToken(code) {
    const clientId = "126877";
    const clientSecret = "988cc2b69cdee2fc1da49deac39f4b9eee6a5bb3"; 
    const redirectUri = "https://soushirou16.github.io/visualizer.html";
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
        localStorage.setItem('strava_refresh_token', data.refresh_token);
        localStorage.setItem('strava_token_expires_at', data.expires_at);
        fetchActivities();
    } else {
        // handle error, maybe redirect to an error page?
        window.location.href = "https://soushirou16.github.io/index.html";
    }
}

async function fetchActivities() {
    const accessToken = await getAccessToken();

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
        fetchAthlete();
    } else {
        localStorage.clear();
        window.location.href = "https://soushirou16.github.io/index.html";
    }
}

async function fetchAthlete() {
    const accessToken = await getAccessToken();

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

async function color_activities(total_meters, total_elapsed_time){
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
        // adds delay in between each coloration
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    display_stats_data(total_meters, total_elapsed_time, ran_streak, miss_streak);


}

async function deauthorize() {
    const accessToken = getAccessToken();
    const deauthorizeUrl = `https://www.strava.com/oauth/deauthorize?access_token=${accessToken}`;

    const response = await fetch(deauthorizeUrl, {
        method: 'POST'
    });

    if (response.ok) {
        localStorage.clear();
        window.location.href = "https://soushirou16.github.io/index.html";
    }
}


// helper methods
function convertToKey(date){
    let month = (date.getMonth() + 1).toString(); 
    let day = date.getDate().toString();
    let key = "M" + month + "_D" + day;
    return key;
}

async function refreshAccessToken() {
    const clientId = "126877";
    const clientSecret = "988cc2b69cdee2fc1da49deac39f4b9eee6a5bb3"; 
    const refreshToken = localStorage.getItem('strava_refresh_token');
    const tokenUrl = 'https://www.strava.com/api/v3/oauth/token';

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('strava_access_token', data.access_token);
        localStorage.setItem('strava_refresh_token', data.refresh_token);
        localStorage.setItem('strava_token_expires_at', data.expires_at);
        return data.access_token;
    } else {
        // Handle error, maybe redirect to an error page
        console.error('Error refreshing access token:', response.statusText);
        return null;
    }
}

function getAccessToken() {
    const token = localStorage.getItem('strava_access_token');
    const expiresAt = localStorage.getItem('strava_token_expires_at');
    const currentTime = Math.floor(Date.now() / 1000);

    if (token && expiresAt && currentTime < expiresAt) {
        return token;
    } else if (token && expiresAt && currentTime >= expiresAt) {
        return refreshAccessToken();
    } else {
        return null;
    }
}


// side bar stats
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