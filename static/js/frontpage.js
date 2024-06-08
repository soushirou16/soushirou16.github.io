
// authorization button
document.getElementById('button').addEventListener('click', () => {
    window.location.href = '/authorize';
});

const elements = Array.from(document.getElementsByClassName("days"));
const colors = ["green1", "green2", "green3", "green4", "green5", "green6", "green7", 
    "gray", "gray", "gray", "gray", "gray"];


elements.forEach(element => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    const randomColor = colors[randomIndex];
    element.classList.add(randomColor);
});