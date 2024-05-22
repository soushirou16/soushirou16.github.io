// authorization button
document.getElementById('authbutton').addEventListener('click', () => {
    const authUrl = '/authorize';
    window.open(authUrl, '_blank', 'width=600,height=800');
});

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
        var distanceRan = 0;
        // only checking by activity. make it so it's by day and store the values to be used later.
        data.forEach(activity => { 
            var startDate = new Date(activity.start_date);

            var month = startDate.getMonth() + 1; 
            var day = startDate.getDate() - 1;

            var parentElement = document.getElementById(month)
            var daysInMonth = parentElement.querySelectorAll('.days');
            
            if(activity.distance < 1800){
                daysInMonth[day].classList.add('lvl1green');
            }
            else if (activity.distance < 3400){
                daysInMonth[day].classList.add('lvl2green');
            }
            else if (activity.distance < 5000){
                daysInMonth[day].classList.add('lvl3green');
            }
            
            
            
            distanceRan += activity.distance;

        });

        distanceRan = distanceRan/1600;
        ext=document.getElementById('statstext');
        ext.textContent = distanceRan.toString() + " miles";

    })
});


// add the hover for more info functionality
days = document.getElementsByClassName('days');
for (var i = 0; i < days.length; i++){
    days[i].addEventListener("mouseover", function(){
        var timeout = setTimeout(function(){
        var currentDay = this; // Capture the current element being hovered over

        currentDay.classList.add('lvl5green');
            //do the hover thing
        }, 1500);

        days[i].addEventListener("mouseout", function(){
            clearTimeout(timeout)
        });
    });
}

