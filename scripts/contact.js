// Contact form (EmailJS)
// Ensure emailjs is loaded before initializing + binding handlers.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact__form");
  const status = document.getElementById("status");

  if (!form || !status) return;

  if (!window.emailjs || typeof window.emailjs.init !== "function") {
    console.error("EmailJS is not available. Check script order / network.");
    status.textContent = "Email service failed to load. Please try again.";
    status.style.color = "#ff6b6b";
    return;
  }

  window.emailjs.init({
    publicKey: "b-W7Lm8a9At2cTaqi",
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

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

    window.emailjs
      .sendForm("service_mq0pjeu", "template_pghopyr", form)
      .then(() => {
        status.textContent = "✔ Message sent successfully!";
        status.style.color = "#4CAF50";
        form.reset();
      })
      .catch((error) => {
        console.error("EmailJS sendForm error:", error);
        status.textContent = "X Failed to send message!";
        status.style.color = "#ff6b6b";
      });
  });
});

