
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

function toggleSideTab() {
    var stats_tab = document.getElementById("stats_tab_id");
    stats_tab.classList.toggle('open');
}