const usernameEl = document.getElementById('username') as HTMLInputElement;
const passwordEl = document.getElementById('password') as HTMLInputElement;
const errorEl = document.getElementById('error-msg') as HTMLElement;

async function submit(mode: 'login' | 'signup' | 'guest') {
  const username = usernameEl.value.trim();
  const password = passwordEl.value;
  if (mode != 'guest' && (!username || !password)) {
    errorEl.textContent = 'Username and password required';
    return;
  }

  try {
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      errorEl.textContent = data.error ?? 'Something went wrong';
      return;
    }
    window.location.href = '/';
  } catch {
    errorEl.textContent = 'Network error';
  }
}

document.getElementById('login')?.addEventListener('click', () => submit('login'));
document.getElementById('signup')?.addEventListener('click', () => submit('signup'));
document.getElementById('guest')?.addEventListener('click', () => submit('guest'));

// enter submits login
passwordEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submit('login');
});