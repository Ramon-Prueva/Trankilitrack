
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    

    darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);

        localStorage.setItem('darkMode', this.checked);
    });
    

    const darkModeSaved = localStorage.getItem('darkMode');
    if (darkModeSaved === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
}


function animateSensorCards() {
    const sensorCards = document.querySelectorAll('.sensor-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sensorCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    animateSensorCards();
    

    const title = document.querySelector('.container h1');
    title.addEventListener('mouseenter', () => {
        title.style.transform = 'perspective(500px) rotateX(15deg) scale(1.03)';
    });
    title.addEventListener('mouseleave', () => {
        title.style.transform = 'perspective(500px) rotateX(10deg) scale(1)';
    });
});