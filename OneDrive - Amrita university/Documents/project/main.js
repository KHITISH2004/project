// State management
let currentUser = null;
let events = [];
//Helper functions
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function toggleForms() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('registerForm').classList.toggle('hidden');
}

function showAuthForms() {
    document.getElementById('authForms').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('authForms').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    fetchEvents();
}
// Auth functions
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            localStorage.setItem('user', JSON.stringify(data));
            showMainApp();
            showToast('Login successful!');
        } else {
            showToast('Login failed. Please check your credentials.');
        }
    } catch (error) {
        showToast('An error occurred. Please try again.');
    }
}
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    try {
        const response = await fetch('http://127.0.0.1:8000/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        if (response.ok) {
            showToast('Registration successful! Please login.');
            toggleForms();
        } else {
            showToast('Registration failed. Please try again.');
        }
    } catch (error) {
        showToast('An error occurred. Please try again.');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    showAuthForms();
    showToast('Logged out successfully!');
}
async function handleCreateEvent(event) {
    event.preventDefault();
    const eventName = document.getElementById('eventName').value;
    const eventDateTime = document.getElementById('eventDateTime').value;
    const eventDescription = document.getElementById('eventDescription').value;
    try {
        const response = await fetch('http://127.0.0.1:8000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`,
            },
            body: JSON.stringify({
                event_name: eventName,
                event_datetime: eventDateTime,
                event_description: eventDescription,
            }),
        });
        if (response.ok) {
            showToast('Event created successfully!');
            event.target.reset();
            fetchEvents();
        } else {
            showToast('Failed to create event. Please try again.');
        }
    } catch (error) {
        showToast('An error occurred. Please try again.');
    }
}
async function fetchEvents() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/events', {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
            },
        });

        if (response.ok) {
            events = await response.json();
            renderEvents();
        }
    } catch (error) {
        showToast('Failed to fetch events.');
    }
}
async function deleteEvent(id) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
            },
        });
        if (response.ok) {
            showToast('Event deleted successfully!');
            fetchEvents();
        } else {
            showToast('Failed to delete event.');
        }
    } catch (error) {
        showToast('An error occurred. Please try again.');
    }
}

function renderEvents() {
    const eventsContainer = document.getElementById('eventsList');
    eventsContainer.innerHTML = '';

    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <h3>${event.event_name}</h3>
            <p>${new Date(event.event_datetime).toLocaleString()}</p>
            <p>${event.event_description}</p>
            <div class="event-actions">
                <button onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        `;
        eventsContainer.appendChild(eventCard);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showAuthForms();
    }
});