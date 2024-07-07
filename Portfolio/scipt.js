// script.js

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        console.log('Name:', name);  // Debugging
        console.log('Email:', email);  // Debugging
        console.log('Message:', message);  // Debugging

        if (name && email && message) { // Ensure values are not empty
            const contactMessage = {
                name,
                email,
                message,
                timestamp: new Date().toISOString()
            };

            saveMessage(contactMessage);

            contactForm.reset();
            alert('Your message has been sent!');
        } else {
            alert('Please fill out all fields.');
        }
    });

    function saveMessage(message) {
        let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        messages.push(message);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        console.log('Messages Saved:', messages); // Debugging
    }
});
