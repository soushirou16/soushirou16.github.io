


var datadict = {}
var totalMiles = 0;
var totalElapsedTime = 0;
// logic for displaying data. sends a call to api
send_api_call();


function send_api_call() {
    // sends a call
    fetch('/athlete/activities')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }
        
        return response.json();
    })
    .then(data => {

        // color the squares
        // only checking by activity. make it so it's by day and store the values to be used later.

        let todaysDate = new Date();
        let todaysKey = convertToKey(todaysDate);
        
        let todaysDiv = document.getElementById(todaysKey);
        todaysDiv.style.borderColor = "black";
        
        // organize the data
        data.forEach(activity => { 
            let date = new Date(activity.start_date);
            let key = convertToKey(date);
            
            let currDay = document.getElementById(key);
            
            if (!datadict[key]){
                datadict[key] = [];
            }
            
            datadict[key].push({
                'type': activity.type,
                'date': date,
                'distance': activity.distance,
                'elapsed_time': activity.elapsed_time,
                'start_time': activity.start_date_local
            });

            totalMiles += activity.distance;
            totalElapsedTime += activity.elapsed_time;
            
            if(activity.distance < 1800){
                currDay.classList.add('lvl1green');
            }
            else if (activity.distance < 3600){
                currDay.classList.add('lvl2green');
            }
            else if (activity.distance < 5400){
                currDay.classList.add('lvl3green');
            }
            else{
                currDay.classList.add('lvl4green');
            }
        });        
        document.getElementById('totalmilestext').textContent += (totalMiles/1600).toFixed(2) + " miles";

        var formattedTime = formatTime(totalElapsedTime);
        document.getElementById('totaltimetext').textContent += formattedTime;

    })
};


// add the hover for more info functionality
var moreInfoDiv = document.getElementById("moreinfodiv");
var childDivs = moreInfoDiv.querySelectorAll("p");
var timeout;

function handleDayHover(event) {
    let currentDay = this;
    let currentDayID = currentDay.id;
    
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

var days = document.getElementsByClassName('days');
for (var i = 0; i < days.length; i++) {
    days[i].addEventListener("mouseover", handleDayHover);
    days[i].addEventListener('mousemove', function(event){
        moreInfoDiv.style.left = event.clientX + 40 + 'px';
        moreInfoDiv.style.top = event.clientY + + -70 + 'px';
    });

    days[i].addEventListener("mouseout", function(){
        moreInfoDiv.style.opacity = '0';
        clearTimeout(timeout);
    });
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
