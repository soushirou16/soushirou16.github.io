document.getElementById('authbutton').addEventListener('click', () => {
    const authUrl = '/authorize';
    const popup = window.open(authUrl, '_blank', 'width=600,height=800');
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
        alert('allow popups');
    }
});


document.getElementById('txtbutton').addEventListener('click', function() {
    fetch('/athlete/activities')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch activities');
        }
        
        return response.json(); // Convert response to JSON
    })
    .then(data => {

        //color the squares
        var distanceRan = 0;
        //only checking by activity
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
    .catch(error => {
        console.error('Error:', error);
    });
});
