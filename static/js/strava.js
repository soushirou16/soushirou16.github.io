

// authorization button
document.getElementById('authbutton').addEventListener('click', () => {
    window.open('/authorize', '_blank', 'width=600,height=800');
});


var datadict = {}
// logic for displaying data. sends a call to api
document.getElementById('displaybutton').addEventListener('click', function() {
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
        
        data.forEach(activity => { 
            var startDate = new Date(activity.start_date);

            var month = (startDate.getMonth() + 1).toString(); 
            var day = startDate.getDate().toString();
            var date = month + "/" + day;
            var key = "M" + month + "_D" + day;
            
            var currDay = document.getElementById(key);
            
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
            
            if(activity.distance < 1800){
                currDay.classList.add('lvl1green');
            }
            else if (activity.distance < 3400){
                currDay.classList.add('lvl2green');
            }
            else if (activity.distance < 5000){
                currDay.classList.add('lvl3green');
            }
        });        
    })
});


// add the hover for more info functionality
var moreInfoDiv = document.getElementById("moreinfodiv");
var childDivs = moreInfoDiv.querySelectorAll("p");
var timeout;

function handleDayHover(event) {
    var currentDay = this;
    var currentDayID = currentDay.id;
    
    if (datadict[currentDayID] && datadict[currentDayID].length > 0) {
        var cursorX = event.clientX;
        var cursorY = event.clientY;

        moreInfoDiv.style.left = cursorX + 40 + 'px';
        moreInfoDiv.style.top = cursorY + + -70 + 'px';

        childDivs[0].textContent = datadict[currentDayID][0]['date'];
        childDivs[1].textContent = (datadict[currentDayID][0]['distance'] / 1600).toFixed(2) + " miles";
        childDivs[2].textContent = (datadict[currentDayID][0]['elapsed_time'] / 60).toFixed(2) + "min";

        timeout = setTimeout(function(){
        moreInfoDiv.style.opacity = '100';
        }, 350);
    } else {
        moreInfoDiv.style.display = '0';
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
