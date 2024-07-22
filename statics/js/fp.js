background();


// starts auth process
async function authorize() {
    const clientId = "126877";
    const redirectUri = "http://soushirou16.github.io/visualizer.html";
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=activity:read_all`;

    window.location.href = authUrl;
}



function background(){
    const elements = Array.from(document.getElementsByClassName("days"));
    const colors = ["green1", "green2", "green3", "green4", "green5", "green6", "green7", 
        "gray", "gray", "gray", "gray", "gray"];
    
    
    elements.forEach(element => {
        const randomIndex = Math.floor(Math.random() * colors.length);
        const randomColor = colors[randomIndex];
        element.classList.add(randomColor);
    });
}
