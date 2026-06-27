emailjs.init({
  publicKey: "b-W7Lm8a9At2cTaqi",
});
const form = document.querySelector(".contact__form");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const status = document.getElementById("status");

  const name = form.querySelector('input[name="name"]')?.value.trim();
  const email = form.querySelector('input[name="email"]')?.value.trim();
  const message = form.querySelector('textarea[name="message"]')?.value.trim();



  if (!name || !email || !message) {

    alert("Please fill out all fields (name, email, and message) before submitting.");
    status.textContent = "Please fill out all fields (name, email, and message) before submitting.";

    status.style.color = "#ff6b6b";
    return;
  }



  status.textContent = "Sending...";

  status.style.color = "#ffffff";

  emailjs
    .sendForm("service_mq0pjeu", "template_pghopyr", form)
    .then((res) => {
      status.textContent = "✔ Message sent successfully!";
      status.style.color = "#4CAF50";
      form.reset();

    })
    .catch((error) => {
      status.textContent = "X Failed to send message!";
      status.style.color = "#ff6b6b";

    });
});

// Mobile Navigation Toggle
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const navRight = document.querySelector("nav .right");
  const navLinks = document.querySelectorAll("nav ul li a");

  if (menuToggle && navRight) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      navRight.classList.toggle("active");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navRight.classList.remove("active");
      });
    });
  }
});

