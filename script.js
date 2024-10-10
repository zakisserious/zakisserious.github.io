function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

window.addEventListener('scroll', function() {
  const navbar = document.querySelector('nav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const logo = document.querySelector('.logo');

  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
    logo.style.fontSize = '1.5rem'; // Smaller logo size
    navLinks.forEach(link => {
      link.style.fontSize = '1rem'; // Smaller link size
    });
  } else {
    navbar.classList.remove('scrolled');
    logo.style.fontSize = '2rem'; // Original logo size
    navLinks.forEach(link => {
      link.style.fontSize = '1.5rem'; // Original link size
    });
  }
});
