let authToken = '';

async function signup() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const bio = document.getElementById('signup-bio').value;

    const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, bio })
    });

    const data = await response.json();
    if (response.ok) {
        alert('Signup successful! Please login.');
        document.getElementById('signup-form').style.display = 'none';
    } else {
        alert(data.error || 'Error signing up!');
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        authToken = data.token;
        alert('Login successful! You can now send messages.');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('message-form').style.display = 'block';
        loadMessages();
    } else {
        alert(data.error || 'Login failed!');
    }
}

async function sendMessage() {
    const receiverId = document.getElementById('receiver-id').value;
    const content = document.getElementById('message-content').value;

    const response = await fetch('http://localhost:5000/api/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ receiverId, content })
    });

    const data = await response.json();
    if (response.ok) {
        alert('Message sent successfully!');
        document.getElementById('message-content').value = ''; // Clear the input
        loadMessages();
    } else {
        alert(data.error || 'Error sending message!');
    }
}


async function loadMessages() {
    const response = await fetch('http://localhost:5000/api/messages', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });

    const data = await response.json();
    if (response.ok) {
        const messagesList = document.getElementById('messages-list');
        messagesList.innerHTML = '';
        data.forEach(message => {
            const listItem = document.createElement('li');
            listItem.textContent = `${message.sender.username}: ${message.content}`;
            messagesList.appendChild(listItem);
        });
    } else {
        alert(data.error || 'Error loading messages!');
    }
}
