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
