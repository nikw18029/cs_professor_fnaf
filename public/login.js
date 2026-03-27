const STORAGE_KEY = "users";

function getUsers() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Page elements
const gamePage = document.getElementById("index");
const loginPage = document.getElementById("login-page");
const signupPage = document.getElementById("signup-page");
const dashboardPage = document.getElementById("dashboard-page");

// Show/hide pages
function showPage(page) {
    loginPage.style.display = "none";
    signupPage.style.display = "none";
    dashboardPage.style.display = "none";
    page.style.display = "block";
}

// Switching loging in and signing up
document.getElementById("show-signup").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-error").textContent = "";
    showPage(signupPage);
});

document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("signup-error").textContent = "";
    showPage(loginPage);
});

// Sign up
document.getElementById("signup-btn").addEventListener("click", () => {
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    const errorEl = document.getElementById("signup-error");

    if (!name || !email || !password) {
        errorEl.textContent = "All fields are required.";
        return;
    }

    if (password.length < 6) {
        errorEl.textContent = "Password must be at least 6 characters.";
        return;
    }

    const users = getUsers();

    if (users.find((u) => u.email === email)) {
        errorEl.textContent = "An account with this email already exists.";
        return;
    }

    users.push({ name, email, password });
    saveUsers(users);

    errorEl.textContent = "";
    alert("Account created");
    showPage(loginPage);
});

// Log in
document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");

    if (!email || !password) {
        errorEl.textContent = "Email and password are required.";
        return;
    }

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
        errorEl.textContent = "Invalid email or password.";
        return;
    }

    errorEl.textContent = "";
    document.getElementById("dash-name").textContent = user.name;
    document.getElementById("dash-email").textContent = user.email;
    showPage(dashboardPage);
});

// Log out
document.getElementById("logout-btn").addEventListener("click", () => {
    showPage(loginPage);
});

// view password function with svgs for password eye symbol
function togglePassword(el) {
    const input = el.closest('.password-wrapper').querySelector('input');
    if (input.type === "password") {
        input.type = "text";
        el.innerHTML = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>`;
    } else {
        input.type = "password";
        el.innerHTML = `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>`;
    }
}
